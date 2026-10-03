/**
 * Editor bridge over Node IPC (`--editor-ipc`): the editor sends
 * `{ type: "command", event, args }` messages, the game's events come back as
 * `{ type: "bridge", event, args }`. See the engine's editor protocol.
 */
export interface IpcChannel {
  send?: (message: unknown) => unknown;
  on(event: "message", listener: (message: unknown) => void): unknown;
}

type Listener = (...args: unknown[]) => void;

/** Editor → engine, drained by the engine at the start of each tick. */
class QueuedEmitter {
  private readonly listeners = new Map<string, Listener[]>();
  private queue: [string, unknown[]][] = [];

  on(event: string, listener: Listener): void {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
  }

  off(event: string, listener: Listener): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) ?? []).filter((registered) => registered !== listener),
    );
  }

  emit(event: string, ...args: unknown[]): void {
    this.queue.push([event, args]);
  }

  runEvents(): void {
    const pending = this.queue;
    this.queue = [];
    for (const [event, args] of pending) {
      for (const listener of this.listeners.get(event) ?? []) {
        try {
          listener(...args);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
}

const isCommand = (message: unknown): message is { event: string; args?: unknown[] } =>
  typeof message === "object" &&
  message !== null &&
  (message as { type?: unknown }).type === "command" &&
  typeof (message as { event?: unknown }).event === "string";

/** `RunOptions.editor` for a game bridged to its editor over `channel`. */
export const createIpcEditor = (channel: IpcChannel) => {
  const fromEditor = new QueuedEmitter();
  channel.on("message", (message) => {
    if (isCommand(message)) fromEditor.emit(message.event, ...(message.args ?? []));
  });
  const toEditor = {
    on() {},
    off() {},
    runEvents() {},
    emit(event: string, ...args: unknown[]) {
      channel.send?.({ type: "bridge", event, args });
    },
  };
  return { toEditor, fromEditor };
};
