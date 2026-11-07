import { describe, expect, it } from "bun:test";
import { join, resolve } from "node:path";

import { resolveInside } from "../src/safe-path";

const root = resolve("/srv/game");

describe("resolveInside", () => {
  it("resolves paths inside the root", () => {
    expect(resolveInside(root, "/index.js")).toBe(join(root, "index.js"));
    expect(resolveInside(root, "/assets/a b.png")).toBe(join(root, "assets", "a b.png"));
    expect(resolveInside(root, "/assets/../index.js")).toBe(join(root, "index.js"));
    expect(resolveInside(root, "/..file.txt")).toBe(join(root, "..file.txt"));
  });

  it("resolves the root itself", () => {
    expect(resolveInside(root, "/")).toBe(root);
  });

  it("refuses paths that leave the root", () => {
    expect(resolveInside(root, "/../secret.txt")).toBeNull();
    expect(resolveInside(root, decodeURIComponent("/..%2F..%2Fetc%2Fpasswd"))).toBeNull();
    expect(resolveInside(root, "/assets/../../secret.txt")).toBeNull();
    expect(resolveInside(root, "..")).toBeNull();
  });

  it("treats an absolute request path as relative to the root", () => {
    expect(resolveInside(root, "/etc/passwd")).toBe(join(root, "etc", "passwd"));
  });

  it("refuses a sibling folder sharing the root's prefix", () => {
    expect(resolveInside(root, "/../game-secrets/key")).toBeNull();
  });
});
