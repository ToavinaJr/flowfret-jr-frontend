import en from "./en/translation.json";
import fr from "./fr/translation.json";

function flattenStrings(
  value: unknown,
  prefix = "",
): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value).flatMap(([key, child]) =>
    flattenStrings(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translation catalogs", () => {
  const english = flattenStrings(en);
  const french = flattenStrings(fr);

  it("have the same set of translation keys", () => {
    expect(french.map(([key]) => key).sort()).toEqual(
      english.map(([key]) => key).sort(),
    );
  });

  it("contain no replacement characters or common UTF-8 mojibake", () => {
    const suspiciousText = /\uFFFD|Ã.|Â.|â€|â€™/u;
    const invalid = [...english, ...french].filter(([, text]) =>
      suspiciousText.test(text),
    );

    expect(invalid).toEqual([]);
  });
});
