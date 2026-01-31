server
=============

**Package**: ``@nanoforge-dev/loader-server``

The server loader executes NanoForge game server logic in a Node.js
environment. It runs the game's ``main.js`` in a worker thread with
file access and optional hot reload.

Overview
--------

The server loader:

- Scans the game directory for files
- Locates the ``main.js`` entry point
- Forks a worker process to execute game code
- Provides file paths to the game via a Map
- Optionally restarts on file changes

Environment Variables
---------------------

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - Variable
     - Required
     - Description
   * - ``GAME_DIR``
     - Yes
     - Absolute path to the game directory
   * - ``WATCH``
     - No
     - Set to any value to enable hot reload

Game Entry Point
----------------

The server loader expects a ``main.js`` file in the game directory that
exports a ``main`` function:

.. code-block:: typescript

    interface RunOptions {
      files: Map<string, string>;
    }

    export async function main(options: RunOptions): Promise<void> {
      // Game server logic
      const files = options.files;
      // files.get("/assets/config.json") -> absolute path to file
    }

The ``files`` map contains all game files with their relative paths as keys
and absolute file system paths as values.

Worker Thread
-------------

The game code runs in a separate worker thread (child process), which:

- Isolates game code from the loader process
- Enables clean restarts during hot reload
- Prevents game crashes from affecting the loader

Source Modules
--------------

server.ts
^^^^^^^^^

Bootstrap entry point that:

1. Reads the game directory
2. Locates ``main.js``
3. Forks the worker process
4. Sets up file watching if enabled

.. code-block:: typescript

    async function bootstrap(): Promise<void>

worker.ts
^^^^^^^^^

Worker thread implementation that:

1. Receives the main path and file list via process arguments
2. Imports the game's main module using ``createRequire``
3. Calls the ``main()`` function with the files map

.. code-block:: typescript

    interface MainFunction {
      main: (options: { files: Map<string, string> }) => Promise<void>;
    }

env.ts
^^^^^^

Environment variable accessors:

.. code-block:: typescript

    function getGameDir(): string
    function getWatch(): string | undefined

files.ts
^^^^^^^^

File system utilities:

.. code-block:: typescript

    function getFiles(gameDir: string): [string, string][]

Returns an array of tuples containing ``[relativePath, absolutePath]`` for
all files in the game directory.

watch.ts
^^^^^^^^

File watching for hot reload:

.. code-block:: typescript

    function startWatch(
      gameDir: string,
      callback: () => Promise<void>
    ): void

Calls the callback function when files change, allowing the server to
restart the worker process.

Usage
-----

.. code-block:: bash

    # Set required environment variables
    export GAME_DIR=/path/to/game

    # Start the server loader
    pnpm --filter @nanoforge-dev/loader-server start

    # With hot reload
    export WATCH=1
    pnpm --filter @nanoforge-dev/loader-server start

Example Game Server
-------------------

.. code-block:: javascript

    // main.js
    export async function main(options) {
      const { files } = options;

      console.log("Server starting...");
      console.log("Available files:", [...files.keys()]);

      // Read a config file
      const configPath = files.get("/config.json");
      if (configPath) {
        const config = await import(configPath, { with: { type: "json" } });
        console.log("Config loaded:", config);
      }

      // Your game server logic here
      // e.g., start a WebSocket server, initialize game state, etc.
    }
