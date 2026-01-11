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
