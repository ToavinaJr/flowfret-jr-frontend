export interface TextSelection {
  start: number;
  end: number;
}

export interface TextInsertion {
  value: string;
  caret: number;
}

/**
 * Replaces the selected range with `insertion` and returns the caret position
 * right after it. Returns the input unchanged when the result would exceed
 * `maxLength`, so a full composer never truncates an emoji mid-surrogate pair.
 */
export function insertTextAtSelection(
  value: string,
  insertion: string,
  selection: TextSelection,
  maxLength: number,
): TextInsertion {
  const start = Math.min(Math.max(selection.start, 0), value.length);
  const end = Math.min(Math.max(selection.end, start), value.length);
  const nextLength = value.length - (end - start) + insertion.length;
  if (nextLength > maxLength) return { value, caret: start };
  return {
    value: `${value.slice(0, start)}${insertion}${value.slice(end)}`,
    caret: start + insertion.length,
  };
}
