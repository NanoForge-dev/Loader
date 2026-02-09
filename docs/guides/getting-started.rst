Getting Started
===============

This guide explains how to use the NanoForge Loader packages to run
NanoForge game engine projects.

Prerequisites
-------------

- `Node.js <https://nodejs.org/>`_ version 25 or later
- `Bun <https://bun.sh/>`_ runtime (for client loader)
- A package manager: npm, yarn, pnpm, or bun

Installation
------------

Install the loader packages as dependencies in your project:

.. code-block:: bash

    # npm
    npm install @nanoforge-dev/loader-client @nanoforge-dev/loader-server

    # pnpm
    pnpm add @nanoforge-dev/loader-client @nanoforge-dev/loader-server

    # yarn
    yarn add @nanoforge-dev/loader-client @nanoforge-dev/loader-server

    # bun
    bun add @nanoforge-dev/loader-client @nanoforge-dev/loader-server

Running the Client Loader
-------------------------

The client loader serves your game in a browser environment.

Basic Usage
^^^^^^^^^^^

Set the required environment variables and start the loader:

.. code-block:: bash

    export PORT=3000
    export GAME_DIR=/path/to/your/game
    pnpm --filter @nanoforge-dev/loader-client start

Open ``http://localhost:3000`` in your browser to load and play the game.

With Hot Reload
^^^^^^^^^^^^^^^

Enable hot reload for development:

.. code-block:: bash

    export PORT=3000
    export GAME_DIR=/path/to/your/game
    export WATCH=true
    export WATCH_PORT=3001
    pnpm --filter @nanoforge-dev/loader-client start

The browser will automatically reload when game files change.

Environment Variables
^^^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Variable
     - Description
   * - ``PORT``
     - HTTP server port (required)
   * - ``GAME_DIR``
     - Path to game directory (required)
   * - ``WATCH``
     - Set to ``"true"`` to enable hot reload
   * - ``WATCH_PORT``
     - WebSocket port for hot reload notifications
   * - ``WATCH_SERVER_GAME_DIR``
     - Server game directory for watch coordination
   * - ``PUBLIC_*``
     - Any ``PUBLIC_`` prefixed variable is exposed to the client

Running the Server Loader
-------------------------

The server loader executes your game's server-side logic.

Basic Usage
^^^^^^^^^^^

Set the game directory and start the loader:

.. code-block:: bash

    export GAME_DIR=/path/to/your/game
    pnpm --filter @nanoforge-dev/loader-server start

The server will locate ``main.js`` in your game directory and execute it
in a worker thread.

With Hot Reload
^^^^^^^^^^^^^^^

Enable hot reload for development:

.. code-block:: bash

    export GAME_DIR=/path/to/your/game
    export WATCH=1
    pnpm --filter @nanoforge-dev/loader-server start

The worker will restart when game files change.

Game Entry Point
^^^^^^^^^^^^^^^^

Your game must have a ``main.js`` file that exports a ``main`` function:

.. code-block:: javascript

    // main.js
    export async function main(options) {
      const files = options.files;
      console.log("Server started with files:", [...files.keys()]);

      // Your game server logic here
    }

The ``options.files`` map contains all game files with their paths.

Project Structure
-----------------

A typical NanoForge game project structure:

::

    my-game/
    +-- main.js              # Entry point (exports main function)
    +-- assets/
    |   +-- sprites/
    |   +-- sounds/
    |   +-- config.json
    +-- components/
    +-- systems/
    +-- package.json

The loader will include all files in the manifest and make them available
to your game code.

Using with NanoForge CLI
------------------------

The loader is typically invoked through the NanoForge CLI rather than
directly:

.. code-block:: bash

    # Run client (browser) game
    nanoforge run --part client

    # Run server game
    nanoforge run --part server

    # Development mode with hot reload
    nanoforge dev

The CLI handles environment variable setup and loader invocation.

Typical Development Workflow
----------------------------

1. **Create a NanoForge project** using schematics:

   .. code-block:: bash

       schematics @nanoforge-dev/schematics:application my-game

2. **Install dependencies**:

   .. code-block:: bash

       cd my-game
       pnpm install

3. **Generate client base code**:

   .. code-block:: bash

       schematics @nanoforge-dev/schematics:part-base my-game --part=client

4. **Generate main entry point**:

   .. code-block:: bash

       schematics @nanoforge-dev/schematics:part-main my-game --part=client

5. **Build your game**:

   .. code-block:: bash

       pnpm build

6. **Run in development mode** with hot reload:

   .. code-block:: bash

       export PORT=3000
       export GAME_DIR=$(pwd)/dist/client
       export WATCH=true
       pnpm --filter @nanoforge-dev/loader-client start

7. **Open the browser** at ``http://localhost:3000`` to play your game.

Troubleshooting
---------------

Common issues and solutions:

**"PORT env variable not found"**
    Set the ``PORT`` environment variable before starting the client loader.

**"GAME_DIR env variable not found"**
    Set the ``GAME_DIR`` environment variable to your game's build output
    directory.

**"No main.js found"**
    Ensure your game directory contains a ``main.js`` file that exports
    a ``main`` function.

**Game not loading in browser**
    Check the browser console for errors. Ensure the game was built
    correctly and all assets are present in the game directory.

**Hot reload not working**
    Verify ``WATCH=true`` is set and the ``WATCH_PORT`` is available.
    Check that no firewall is blocking WebSocket connections.
