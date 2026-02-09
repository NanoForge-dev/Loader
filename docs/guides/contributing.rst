Contributing
============

This guide explains how to contribute to the NanoForge Loader project.

Prerequisites
-------------

- `Node.js <https://nodejs.org/>`_ version 25
- `pnpm <https://pnpm.io/installation>`_ 10.x
- `Bun <https://bun.sh/>`_ runtime

Setup
-----

1. **Fork and clone** the repository:

   .. code-block:: bash

       git clone https://github.com/<your-username>/Loader.git
       cd Loader

2. **Ensure you are on the main branch**:

   .. code-block:: bash

       git checkout main

3. **Install dependencies**:

   .. code-block:: bash

       pnpm install --frozen-lockfile

   This also sets up Husky git hooks via the ``prepare`` script.

4. **Create a feature branch**:

   .. code-block:: bash

       git checkout -b feat/my-feature

Development Workflow
--------------------

1. Make your changes in the appropriate ``apps/`` package:

   - ``apps/client/`` - Client loader server
   - ``apps/server/`` - Server loader
   - ``apps/website/`` - Browser interface

2. Run formatting and lint fixes:

   .. code-block:: bash

       pnpm format

3. Build all packages to verify there are no errors:

   .. code-block:: bash

       pnpm build

4. Run the full lint check:

   .. code-block:: bash

       pnpm lint

Building Individual Packages
----------------------------

To build a specific package:

.. code-block:: bash

    # Build website
    pnpm --filter @nanoforge-dev/loader-website build

    # Build client
    pnpm --filter @nanoforge-dev/loader-client build

    # Build server
    pnpm --filter @nanoforge-dev/loader-server build

.. note::

   The client package depends on the website package. Build website first
   when making changes to both.

Commit Convention
-----------------

This project uses `Conventional Commits <https://www.conventionalcommits.org/>`_.
Every commit message must follow this format:

::

    <type>(<scope>): <description>

    [optional body]

    [optional footer(s)]

Valid types:

.. list-table::
   :header-rows: 1
   :widths: 15 85

   * - Type
     - Purpose
   * - ``feat``
     - A new feature
   * - ``fix``
     - A bug fix
   * - ``docs``
     - Documentation changes
   * - ``chore``
     - Maintenance tasks (deps, CI, tooling)
   * - ``refactor``
     - Code restructuring without behavior change
   * - ``perf``
     - Performance improvements
   * - ``test``
     - Adding or updating tests
   * - ``style``
     - Code style changes (formatting, whitespace)

Scopes for this project:

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Scope
     - Package
   * - ``loader-client``
     - Client loader package
   * - ``loader-server``
     - Server loader package
   * - ``loader-website``
     - Website package

Examples:

.. code-block:: text

    feat(loader-client): add WebSocket reconnection logic
    fix(loader-server): correct worker restart on file change
    docs: update getting started guide
    chore(deps): update bun to v1.2

Commit messages are validated by ``commitlint`` via a git hook. Commits that
do not follow the convention are rejected.

Pull Request Process
--------------------

1. Push your branch to your fork:

   .. code-block:: bash

       git push origin feat/my-feature

2. `Open a pull request <https://github.com/NanoForge-dev/Loader/compare>`_
   against the ``main`` branch.

3. Ensure the CI pipeline passes (lint checks, builds).

4. Request a review from a maintainer.

5. Once approved, the PR is merged into ``main``.

Code Style
----------

The project enforces consistent code style through ESLint and Prettier.

Naming conventions:

- **Files**: kebab-case (``file-system-manager.ts``)
- **Classes**: PascalCase (``FileSystemManager``)
- **Functions**: camelCase (``loadGameFiles``)
- **Constants**: SCREAMING_SNAKE_CASE (``MANIFEST``)
- **Interfaces**: PascalCase with ``I`` prefix (``IManifest``)

Import ordering (enforced by Prettier plugin):

1. Node.js built-in modules (``node:path``, ``node:fs``)
2. External packages
3. Internal modules (relative imports)

Project Structure
-----------------

When adding code, follow the existing structure:

- **Client**: HTTP server logic in ``apps/client/src/``
- **Server**: Bootstrap and worker in ``apps/server/src/``
- **Website**: Browser modules in ``apps/website/src/``

Each package has its own:

- ``src/`` directory for source code
- ``package.json`` with package-specific scripts
- ``CHANGELOG.md`` for release notes

Dependencies
------------

Dependencies are managed through pnpm workspace version catalogs defined in
``pnpm-workspace.yaml``. When adding or updating a dependency, use the catalog
reference rather than a direct version:

.. code-block:: json

    {
      "devDependencies": {
        "typescript": "catalog:build",
        "eslint": "catalog:lint"
      }
    }

Release Process
---------------

Releases are managed using ``cliff-jumper``:

.. code-block:: bash

    # Generate changelog and bump version
    pnpm --filter @nanoforge-dev/loader-client release
    pnpm --filter @nanoforge-dev/loader-server release
    pnpm --filter @nanoforge-dev/loader-website release

Each package maintains its own version and changelog.

Reporting Issues
----------------

Report bugs and request features on the
`GitHub Issues <https://github.com/NanoForge-dev/Loader/issues>`_ page.

Security
--------

For security vulnerabilities, refer to the ``SECURITY.md`` file in the
repository root for the responsible disclosure process.
