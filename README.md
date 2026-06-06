<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/Loader/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/commits/main"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/Loader.svg?logo=github&logoColor=ffffff" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/Loader.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This repository contains the Loader of NanoForge. Check [releases][github-releases] to see versions of the Loader. NanoForge is a powerful game engine for web browsers.

The Loader is the runtime layer invoked by the [NanoForge CLI][cli-source] when you run `nf start`. It handles both sides of a NanoForge project simultaneously: the **client side** served to the browser and the **server side** running in Node.js.

## Usage

To use the NanoForge Loader, please refer to the [CLI documentation][cli-source]!

First, install the CLI:

```bash
npm install -g @nanoforge-dev/cli
```

Create a new project:

```bash
nf new
```

Then build and start it:

```bash
cd <path_to_my_project>
nf build
nf start
```

## Packages

This monorepo provides three packages, each fulfilling a distinct role at runtime.

- `loader-client` : Bun HTTP server that serves the browser loader UI and the compiled client game files. The entry point for everything the browser sees.
- `loader-server` : Node.js process that runs the compiled server game files in an isolated worker. The entry point for the server-side game logic.
- `loader-website` : Browser application bundled as a static asset. Displays the loading screen, caches game files in the browser and bootstraps the game.

### `@nanoforge-dev/loader-client`

The client loader is a Bun HTTP server that bridges the browser and the compiled game client. It:

- Serves the `loader-website` frontend at `/`
- Exposes the game file manifest at `/manifest`
- Serves compiled game files at `/game/*`
- Exposes `NANOFORGE_*` environment variables at `/env`
- Supports HTTPS/TLS via `--cert` and `--key`
- Supports hot-reload via WebSocket watch mode (`--watch`)

| Option                     | Default             | Description                                    |
| -------------------------- | ------------------- | ---------------------------------------------- |
| `-p, --port <port>`        | `3000`              | Port the HTTP server listens on                |
| `-d, --dir <dir>`          | `.nanoforge/client` | Directory of compiled client game files        |
| `--watch`                  | `false`             | Enable file watcher and browser hot-reload     |
| `--watch-port <port>`      | auto                | Port for the WebSocket watch server            |
| `--watch-server-dir <dir>` | —                   | Also watch a server game directory for changes |
| `--cert <file>`            | —                   | TLS certificate file (enables HTTPS)           |
| `--key <file>`             | —                   | TLS private key file (enables HTTPS)           |

### `@nanoforge-dev/loader-server`

The server loader is a Node.js process that runs the server-side game code. It:

- Scans the game server directory for compiled files
- Forks an isolated worker that requires `/main.js` and calls its exported `main()` function
- Passes all game files and `NANOFORGE_*` environment variables to the game
- Restarts the worker on file changes when `--watch` is enabled

| Option            | Default             | Description                                      |
| ----------------- | ------------------- | ------------------------------------------------ |
| `-d, --dir <dir>` | `.nanoforge/server` | Directory of compiled server game files          |
| `--watch`         | `false`             | Enable file watcher and worker restart on change |

### `@nanoforge-dev/loader-website`

The website loader is a browser application bundled as a static asset and served by `loader-client`. It:

- Displays a loading screen with a progress bar and status messages
- Fetches the manifest from `/manifest` to get the list of game files and the version
- Downloads each game file and stores it locally using the browser's Origin Private File System (OPFS)
- Dynamically imports `/main.js` and calls its exported `main()` function
- Passes the game files map and environment to the game inside a container `<div>`
- Connects to the WebSocket watch server when enabled and reloads the page on `update`
- Catches unhandled errors and displays them on screen

## Environment Variables

Both `loader-client` and `loader-server` collect environment variables prefixed with `NANOFORGE_` and forward them to the game with the prefix stripped:

```
NANOFORGE_MY_VAR=hello  →  { MY_VAR: "hello" }
```

The browser game receives these via the `/env` endpoint. The server game receives them directly as a plain object passed to `main()`.

## Contributing

Please read through our [contribution guidelines][contributing] before starting a pull request. We welcome contributions of all kinds, not just code! If you're stuck for ideas, look for the [good first issue][good-first-issue] label on issues in the repository. If you have any questions about the project, feel free to ask them on [Discussions][discussions]. Before creating your own issue or pull request, always check to see if one already exists! Don't rush contributions, take your time and ensure you're doing it correctly.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please ask on [Discussions][discussions].

[contributing]: https://github.com/NanoForge-dev/Loader/blob/main/.github/CONTRIBUTING.md
[discussions]: https://github.com/NanoForge-dev/Loader/discussions
[cli-source]: https://github.com/NanoForge-dev/CLI
[github-releases]: https://github.com/NanoForge-dev/Loader/releases
[good-first-issue]: https://github.com/NanoForge-dev/Loader/contribute
