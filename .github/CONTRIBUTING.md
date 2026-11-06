# Contributing

If you wish to contribute to the NanoForge project, fork the repository and submit a pull request. Please mind following the pre-commit hooks to keep the codebase as clean as possible.

## Setup

To get ready to work on the codebase, please do the following:

1. Fork & clone the repository, and make sure you're on the **main** branch
2. Run `pnpm install --frozen-lockfile` ([install](https://pnpm.io/installation))
3. Clone the cli and make the cli depend on your loader (put the version of loaders in package.json to `file:relative_path_to_loader_part`)
4. Make your changes
5. Test with the CLI
6. Run `pnpm format && pnpm build` to run ESLint/Prettier, build and tests
7. [Submit a pull request](https://github.com/NanoForge-dev/Loader/compare) (Make sure you follow the [conventional commit format](https://github.com/NanoForge-dev/Loader/blob/main/.github/COMMIT_CONVENTION.md))

## Releases

Releases use the shared workflows of [NanoForge-dev/actions](https://github.com/NanoForge-dev/actions) (`@v3`), configured in `.github/nanoforge.json`. The client, server and website are one `shared` group, versioned together and published to npm.

1. Run the **Release PR** workflow (Actions tab). Leave the inputs empty to take the version from the commits, or set `version`. Use `dry-run` to preview.
2. Review and merge the `releases/loader@<version>` pull request with "Squash and merge".
3. Merging it triggers the **Release** workflow: it publishes the packages on npm, tags and creates the GitHub release, then syncs `docs/docs` to the `cli` category of the docs.

Other merged pull requests release nothing: the group has no `betaOnMerge`. For an alpha of one package, run **Alpha Release** on your branch and pick the package.
