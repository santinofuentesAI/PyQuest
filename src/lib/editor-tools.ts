export const PYTHON_WORDS = ["print", "len", "range", "sum", "min", "max", "sorted", "enumerate", "zip", "int", "float", "str", "bool", "list", "dict", "set", "tuple", "type", "round", "abs", "True", "False", "None", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "def", "return", "import", "from", "as", "try", "except", "class", "append", "mean", "shape", "head", "read_csv", "groupby", "fillna", "isna", "array"];

export function completions(code: string, caret: number, extra: string[] = []) {
  const prefix = code.slice(0, caret).match(/[A-Za-z_][A-Za-z_0-9]*$/)?.[0] ?? "";
  if (!prefix) return [];
  const identifiers = code.match(/\b[A-Za-z_][A-Za-z_0-9]*\b/g) ?? [];
  return [...new Set([...identifiers, ...extra, ...PYTHON_WORDS])]
    .filter((word) => word.startsWith(prefix) && word !== prefix)
    .sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 8);
}

export function insertText(code: string, start: number, end: number, text: string, wrap = false) {
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
  const close = wrap ? pairs[text] ?? "" : "";
  const selected = code.slice(start, end);
  const inserted = close ? text + selected + close : text;
  return { value: code.slice(0, start) + inserted + code.slice(end), caret: start + (close ? text.length + selected.length : inserted.length) };
}

export function completeWord(code: string, start: number, end: number, word: string) {
  const prefix = code.slice(0, start).match(/[A-Za-z_][A-Za-z_0-9]*$/)?.[0] ?? "";
  const suffix = code.slice(end).match(/^[A-Za-z_0-9]*/)?.[0] ?? "";
  return insertText(code, start - prefix.length, end + suffix.length, word);
}
