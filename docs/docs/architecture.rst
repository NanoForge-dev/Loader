Architecture
============

Overview
--------

NanoForge Loader is a runtime system that serves and executes NanoForge game
engine projects. It provides two execution modes:

- **Client mode**: Serves a web interface where users can load and play games
  directly in the browser using WebGL.
- **Server mode**: Executes game server logic in a Node.js worker thread,
  suitable for multiplayer game backends.

Both loaders share a common architecture: they read game files from a directory,
generate a manifest of assets, and execute the game's ``main.js`` entry point.

Technology Stack
----------------

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Component
     - Technology
   * - Language
     - TypeScript (strict mode)
   * - Runtime
     - Bun (bundler and runtime)
   * - Module Formats
     - ESM + CJS (dual package)
   * - Target
     - Browser (client) / Node.js (server)
   * - Package Manager
     - pnpm 10.x
   * - Node Version
     - 25
   * - Linter
     - ESLint 9.x
   * - Formatter
     - Prettier 3.x
   * - CI/CD
     - GitHub Actions

Package Architecture
--------------------

The loader is organized as a monorepo with three packages:

::

    loader/
    +-- apps/
    |   +-- client/              # Browser loader server
    |   |   +-- src/
    |   |   |   +-- server.ts    # HTTP server entry point
    |   |   |   +-- env.ts       # Environment configuration
    |   |   |   +-- files.ts     # File utilities
    |   |   |   +-- manifest.ts  # Manifest generation
    |   |   |   +-- watch.ts     # File watcher for hot reload
    |   |   +-- package.json
    |   +-- server/              # Node.js server loader
    |   |   +-- src/
    |   |   |   +-- server.ts    # Bootstrap entry point
    |   |   |   +-- worker.ts    # Worker thread implementation
    |   |   |   +-- env.ts       # Environment configuration
    |   |   |   +-- files.ts     # File utilities
    |   |   |   +-- watch.ts     # File watcher for hot reload
    |   |   +-- package.json
    |   +-- website/             # Web interface
    |       +-- src/
    |       |   +-- index.ts     # Main entry point
    |       |   +-- cache/       # Caching logic
    |       |   +-- file-system/ # File system abstraction
    |       |   +-- game/        # Game runner
    |       |   +-- loader/      # Game file loader
    |       |   +-- types/       # TypeScript types
    |       |   +-- utils/       # Utility functions
    |       |   +-- version/     # Version management
    |       +-- package.json
    +-- package.json             # Root workspace config
    +-- pnpm-workspace.yaml      # pnpm workspace definition
    +-- turbo.json               # Turbo build configuration

Client Loader Flow
------------------

The client loader implements an HTTP server using Bun:

1. **Server Initialization**: Starts an HTTP server on the configured port.

2. **Route Handling**:

   - ``/`` - Serves the website ``index.html``
   - ``/*`` - Serves static website assets
   - ``/manifest`` - Returns the game file manifest (JSON)
   - ``/env`` - Returns public environment variables
   - ``/game/*`` - Serves game files from the game directory

3. **Manifest Generation**: On each ``/manifest`` request, scans the game
   directory and builds a list of all game files with their paths.

4. **Hot Reload** (optional): When ``WATCH=true``, starts a WebSocket server
   that notifies the browser when game files change.

.. code-block:: text

    Browser                  Client Loader              Game Directory
       |                          |                           |
       |----GET /manifest-------->|                           |
       |                          |---scan directory--------->|
       |                          |<--file list---------------|
       |<---JSON manifest---------|                           |
       |                          |                           |
       |----GET /game/main.js---->|                           |
       |                          |---read file-------------->|
       |<---JavaScript file-------|                           |
       |                          |                           |
       |====WebSocket (watch)=====|                           |
       |<---file changed----------|<--fsnotify---------------|

Server Loader Flow
------------------

The server loader executes game logic in a Node.js worker thread:

1. **Bootstrap**: Reads the game directory and locates ``main.js``.

2. **Worker Fork**: Spawns a child process that runs the worker script.

3. **Game Execution**: The worker imports ``main.js`` and calls its ``main()``
   function with a file map containing all game assets.

4. **Hot Reload** (optional): When watch mode is enabled, the worker process
   is killed and restarted when files change.

.. code-block:: text

    Server Loader                Worker Thread              Game Code
         |                            |                          |
         |---fork(worker.js)--------->|                          |
         |                            |---import main.js-------->|
         |                            |<--main function----------|
         |                            |---call main()----------->|
         |                            |                          |
    [file change detected]            |                          |
         |---kill worker------------->|                          |
         |---fork new worker--------->|                          |

Website Architecture
--------------------

The website package provides the browser-side game loader:

1. **Manifest Fetching**: Requests ``/manifest`` from the client server.

2. **File Caching**: Downloads game files and stores them in browser storage
   (IndexedDB via the file-system abstraction).

3. **Version Checking**: Compares the manifest version with cached version
   to determine if files need updating.

4. **Game Loading**: Imports the main module and creates a file map for
   the game to access assets.

5. **Game Execution**: Calls the game's ``main()`` function with canvas
   and file references.

6. **Watch Integration**: Subscribes to the WebSocket for hot reload
   notifications during development.

Build Pipeline
--------------

The project uses Bun for building and bundling:

.. code-block:: bash

    # Build all packages
    pnpm run build

    # What happens internally:
    # 1. website: bun build -> dist/index.html + assets
    # 2. client: bun build -> dist/server.js
    # 3. server: bun build -> dist/server.js + dist/worker.js

Each package produces optimized bundles for its target environment:

- **Website**: Browser bundle with HTML entry point
- **Client**: Bun-targeted server bundle
- **Server**: Node.js-targeted bundles for server and worker

Turbo is used to orchestrate builds across packages with proper dependency
ordering (website must build before client).
