import { readdir, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { parse } from 'graphql';

const sourceRoot = path.resolve('src');
const outputRoot = path.resolve('.graphql-documents');
const sourceFiles = (await collectSourceFiles(sourceRoot)).sort();
const documents = new Set<string>();
const operationNames = new Set<string>();
const errors: string[] = [];

for (const filePath of sourceFiles) {
  const sourceText = await readFile(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && propertyName(node.name) === 'query') {
      const queryValues = evaluate(node.initializer, sourceFile, new Set());
      if (!queryValues) {
        if (ts.isTemplateExpression(node.initializer)) {
          errors.push(`${relative(filePath)}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}: dynamic GraphQL template could not be resolved`);
        }
      } else {
        for (const query of queryValues) addOperations(query, filePath);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

if (errors.length) {
  throw new Error(`Unable to extract GraphQL operations:\n${errors.join('\n')}`);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
for (const [index, document] of [...documents].entries()) {
  await writeFile(path.join(outputRoot, `document-${index + 1}.graphql`), document, 'utf8');
}
console.log(`Extracted ${documents.size} GraphQL documents from ${sourceFiles.length} source files.`);

function addOperations(document: string, filePath: string) {
  let candidate = document;
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(candidate);
  } catch (error) {
    errors.push(`${relative(filePath)}: invalid GraphQL document: ${String(error)}`);
    return;
  }

  for (const definition of parsed.definitions) {
    if (definition.kind !== 'OperationDefinition' || !definition.name) continue;
    const name = definition.name.value;
    if (operationNames.has(name)) {
      const renamed = `${name}FromDynamicField${operationNames.size}`;
      candidate = candidate.replace(
        new RegExp(`\\b(query|mutation|subscription)\\s+${name}\\b`),
        `$1 ${renamed}`,
      );
    }
  }
  parsed = parse(candidate);
  for (const definition of parsed.definitions) {
    if (definition.kind === 'OperationDefinition' && definition.name) {
      operationNames.add(definition.name.value);
    }
  }
  if (parsed.definitions.length > 0) documents.add(candidate);
}

function evaluate(node: ts.Expression, sourceFile: ts.SourceFile, seen: Set<string>): string[] | undefined {
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return evaluate(node.expression, sourceFile, seen);
  }
  if (ts.isTemplateExpression(node)) {
    let values = [node.head.text];
    for (const span of node.templateSpans) {
      const substitutions = evaluate(span.expression, sourceFile, seen);
      if (!substitutions) return undefined;
      values = values.flatMap((value) => substitutions.map((substitution) => value + substitution + span.literal.text));
    }
    return values;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = evaluate(node.left, sourceFile, seen);
    const right = evaluate(node.right, sourceFile, seen);
    return left && right ? left.flatMap((a) => right.map((b) => a + b)) : undefined;
  }
  if (ts.isConditionalExpression(node)) {
    const whenTrue = evaluate(node.whenTrue, sourceFile, seen);
    const whenFalse = evaluate(node.whenFalse, sourceFile, seen);
    return whenTrue && whenFalse ? [...whenTrue, ...whenFalse] : undefined;
  }
  if (ts.isIdentifier(node)) {
    if (node.text === 'field' && sourceFile.fileName.endsWith('adminApi.ts')) {
      return [
        'adminCreateManagedEntity',
        'adminUpdateManagedEntity',
        'adminDeleteManagedEntity',
        'adminRestoreManagedEntity',
      ];
    }
    if (seen.has(node.text)) return undefined;
    const declaration = findVariable(node.text, sourceFile);
    if (!declaration?.initializer) return undefined;
    return evaluate(declaration.initializer, sourceFile, new Set([...seen, node.text]));
  }
  if (ts.isArrayLiteralExpression(node)) {
    const values = node.elements.map((element) => evaluate(element, sourceFile, seen));
    return values.every(Boolean) ? [values.flat().join('')] : undefined;
  }
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'join') {
    const array = evaluate(node.expression.expression, sourceFile, seen);
    const separator = node.arguments[0] ? evaluate(node.arguments[0], sourceFile, seen) : [''];
    return array && separator ? [array.join(separator[0])] : undefined;
  }
  return undefined;
}

function findVariable(name: string, sourceFile: ts.SourceFile) {
  let declaration: ts.VariableDeclaration | undefined;
  const find = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) declaration = node;
    if (!declaration) ts.forEachChild(node, find);
  };
  find(sourceFile);
  return declaration;
}

function propertyName(name: ts.PropertyName) {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
}

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.isDirectory() && entry.name === 'generated') return [];
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(filePath);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx)$/.test(entry.name) ? [filePath] : [];
  }));
  return nested.flat();
}

function relative(filePath: string) {
  return path.relative(process.cwd(), filePath).replaceAll('\\', '/');
}
