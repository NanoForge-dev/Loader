client
=============

**Package**: ``@nanoforge-dev/loader-client``

The client loader serves a web interface for loading and running NanoForge
games in the browser. It provides an HTTP server that serves the website
assets and game files.

Overview
--------

The client loader is a Bun-based HTTP server that:

- Serves the loader website interface
- Provides a manifest endpoint listing all game files
- Serves game files from a configured directory
- Optionall:white_check_mark: y enables hot reload via WebSocket

Environment Variables
---------------------

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - Variable
     - Required
     - Description
   * - ``PORT``
     - Yes
     - Port number for the HTTP server
   * - ``GAME_DIR``
     - Yes
     - Absolute path to the game directory
   * - ``WATCH``
     - No
     - Set to ``"true"`` to enable hot reload
   * - ``WATCH_PORT``
     - No
     - Port for the WebSocket watch server
   * - ``WATCH_SERVER_GAME_DIR``
     - No
     - Game directory for server-side watch
   * - ``PUBLIC_*``
     - No
     - Any variable prefixed with ``PUBLIC_`` is exposed to the client

API Endpoints
-------------

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Endpoint
     - Description
   * - ``GET /``
     - Serves the main ``index.html`` page
   * - ``GET /*``
     - Serves static website assets
   * - ``GET /manifest``
     - Returns the game manifest as JSON
   * - ``GET /env``
     - Returns public environment variables as JSON
   * - ``GET /game/*``
     - Serves files from the game directory

Manifest Format
---------------

The ``/manifest`` endpoint returns a JSON object:

.. code-block:: typescript

    interface IManifest {
      version: string;
      files: { path: string }[];
      watch: { enable: false } | { enable: true; url: string };
    }

Source Modules
--------------

server.ts
^^^^^^^^^

Main entry point that creates and configures the Bun HTTP server with all
route handlers.

env.ts
^^^^^^

Environment variable accessors:

.. code-block:: typescript

    function getPort(): string
    function getGameDir(): string
    function getWatch(): string | undefined
    function getWatchPort(): string | undefined
    function getWatchServerGameDir(): string | undefined
    function getPublicEnv(): Record<string, string>

manifest.ts
^^^^^^^^^^^

Manifest generation:

.. code-block:: typescript

    const MANIFEST: IManifest
    function updateManifest(gameDir: string): Promise<void>

watch.ts
^^^^^^^^

File watching for hot reload:

.. code-block:: typescript

    function startWatch(
      gameDir: string,
      watchPort: string | undefined,
      watchServerGameDir: string | undefined
    ): void

Usage
-----

.. code-block:: bash

    # Set required environment variables
    export PORT=3000
    export GAME_DIR=/path/to/game

    # Start the client loader
    pnpm --filter @nanoforge-dev/loader-client start

    # With hot reload
    export WATCH=true
    export WATCH_PORT=3001
    pnpm --filter @nanoforge-dev/loader-client start
