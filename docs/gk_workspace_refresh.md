## gk workspace refresh

The refresh command abstracts the complexities of managing repository states by unifying refresh operations like clone and pull into a single, intelligent workflow.
Depending on the context - whether the repositories are already cloned or not - it performs the appropriate action to ensure the workspace is fully synchronized and ready for development.

### Usage
```
gk workspace refresh [flags]
```

### Examples
```
gk ws refresh
gk ws refresh <name>
```

### Flags

```
    --exclude-repos strings   Comma-separated list of workspace repositories to exclude from pull request
    --fetch-only              Fetches updates without checking out or merging changes
-h, --help                    help for refresh
    --include-repos strings   Comma-separated list of workspace repositories to include in pull request
-w, --workspace string        Select the workspace to be modified
```

### SEE ALSO

* [gk workspace](gk_workspace.md)	 - The gk workspace command suite is designed to help developers manage and perform bulk actions across multiple repositories grouped within a workspace.