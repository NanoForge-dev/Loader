website
==============

**Package**: ``@nanoforge-dev/loader-website``

The website package provides the browser-side interface for loading and
running NanoForge games. It handles manifest fetching, file caching,
and game initialization.

Overview
--------

The website is a client-side application that:

- Fetches the game manifest from the loader server
- Caches game files in browser storage
- Loads and executes the game's main module
- Provides a canvas and file access to the game
- Supports hot reload via WebSocket

Modules
-------

loader
^^^^^^

**Path**: ``src/loader/``

Loads game files from the manifest and prepares them for execution.

.. code-block:: typescript

    async function loadGameFiles(
      manifest: IExtendedManifest
    ): Promise<[Map<string, string>, any]>

Returns a tuple containing:

1. A map of file paths to local (cached) paths
2. The imported main module

The loader:

- Iterates through manifest files
- Caches each file locally
- Dynamically imports ``main.js``
- Returns the main module's exports

game
^^^^

**Path**: ``src/game/``

Handles game execution and window management.

.. code-block:: typescript

    function runGame(
      mainModule: any,
      options: Omit<IGameOptions, "canvas">
    ): void

- Switches the UI to game mode
- Gets the canvas element
- Calls the game's ``main()`` function with options

cache
^^^^^

**Path**: ``src/cache/``

Manages browser-side caching of game files for offline support and
faster subsequent loads.

file-system
^^^^^^^^^^^

**Path**: ``src/file-system/``

Provides a file system abstraction over browser storage APIs (IndexedDB):

.. code-block:: typescript

    class FileSystemManager {
      async getDirectory(path: string): Promise<FileSystemDirectory>
      async getFile(path: string): Promise<FileSystemFile>
    }

    class FileSystemDirectory {
      async list(): Promise<string[]>
      async create(): Promise<void>
    }

    class FileSystemFile {
      async read(): Promise<Blob>
      async write(data: Blob): Promise<void>
      async exists(): Promise<boolean>
    }

    class FileSystemHandler {
      // Low-level storage interface
    }

manifest
^^^^^^^^

**Path**: ``src/manifest.ts``

Manifest fetching and validation:

.. code-block:: typescript

    async function getManifest(): Promise<IManifest>
    function isManifestUpToDate(manifest: IManifest): boolean

version
^^^^^^^

**Path**: ``src/version/``

Manages version tracking for cache invalidation:

.. code-block:: typescript

    function getVersion(): string | null
    function setVersion(version: string): void

watch
^^^^^

**Path**: ``src/watch.ts``

WebSocket connection for hot reload notifications.

window
^^^^^^

**Path**: ``src/window.ts``

UI state management:

.. code-block:: typescript

    function setLoadingStatus(status: string): void
    function changeWindowToGame(): void

utils
^^^^^

**Path**: ``src/utils/``

Utility functions:

**logger.utils.ts**

.. code-block:: typescript

    class Logger {
      constructor(prefix: string)
      info(...args: any[]): void
      warn(...args: any[]): void
      error(...args: any[]): void
    }

**document.utils.ts**

.. code-block:: typescript

    function getElementById(id: string): HTMLElement
    function addScript(src: string): void

**delay.utils.ts**

.. code-block:: typescript

    function delay(ms: number): Promise<void>

Types
-----

IManifest
^^^^^^^^^

.. code-block:: typescript

    interface IManifest {
      version: string;
      files: IManifestFile[];
      watch: { enable: false } | { enable: true; url: string };
    }

IManifestFile
^^^^^^^^^^^^^

.. code-block:: typescript

    interface IManifestFile {
      path: string;
    }

IExtendedManifest
^^^^^^^^^^^^^^^^^

Extended manifest with local file paths after caching:

.. code-block:: typescript

    interface IExtendedManifest {
      files: IExtendedManifestFile[];
    }

IExtendedManifestFile
^^^^^^^^^^^^^^^^^^^^^

.. code-block:: typescript

    interface IExtendedManifestFile extends IManifestFile {
      localPath: string;  // Local cached path (blob URL or IndexedDB path)
    }

IGameOptions
^^^^^^^^^^^^

Options passed to the game's main function:

.. code-block:: typescript

    interface IGameOptions {
      canvas: HTMLCanvasElement;
      files: Map<string, string>;
    }

Build Output
------------

The website builds to static assets:

::

    dist/
    +-- index.html      # Main HTML entry point
    +-- index.js        # Bundled JavaScript
    +-- style.css       # Styles
    +-- assets/         # Static assets

These files are served by the client loader and consumed by the browser.
