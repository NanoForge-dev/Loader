import { describe, expect, it } from "bun:test";

import { createIpcEditor } from "../src/editor-ipc";

const channel = () => {
  const sent: unknown[] = [];
  let listener: ((message: unknown) => void) | undefined;
  return {
    sent,
    receive: (message: unknown) => listener?.(message),
    send: (message: unknown) => sent.push(message),
    on: (_event: "message", callback: (message: unknown) => void) => (listener = callback),
  };
};

describe("createIpcEditor", () => {
  it("queues editor commands until the engine drains them", () => {
    const ipc = channel();
    const { fromEditor } = createIpcEditor(ipc);
    const received: unknown[][] = [];
    fromEditor.on("pause", (...args) => received.push(args));

    ipc.receive({ type: "command", event: "pause", args: [1] });
    ipc.receive({ type: "other" });
    expect(received).toEqual([]);
    fromEditor.runEvents();
    expect(received).toEqual([[1]]);
  });

  it("sends engine events to the editor", () => {
    const ipc = channel();
    createIpcEditor(ipc).toEditor.emit("state", "running");
    expect(ipc.sent).toEqual([{ type: "bridge", event: "state", args: ["running"] }]);
  });
});
