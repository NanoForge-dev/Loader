import { isAbsolute, relative, resolve, sep } from "node:path";

/**
 * Resolves a decoded request path inside `root`.
 * Returns `null` when the path points outside of it (`../`, encoded `..%2F`, absolute paths).
 */
export const resolveInside = (root: string, requestPath: string): string | null => {
  const base = resolve(root);
  const full = resolve(base, `.${sep}${requestPath}`);
  const rel = relative(base, full);

  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return null;
  return full;
};
