## gk work start

The "work" command initializes a new work item, setting up the required branches, linking to an issue (e.g., JIRA ticket), and preparing the workspace for focused development.
It serves as the starting point for managing tasks, enhancements, or bug fixes within the gk workflow..

### Usage
```
 gk work start [flags]
```

### Aliases
```
start 
create
```

### Examples
```
gk work start <name>
gk work start "cool new work" --include-repos repo-1,repo-2
```

### Flags

```
    --base-branch string      Base branch from which to create the new branches. The default value is the repository default (i.e. main, master, etc..)
-b, --branch string           Branch name to use across repositories
    --exclude-repos strings   Comma-separated list of workspace repositories to exclude in work on issue
-h, --help                    help for start
    --include-repos strings   Comma-separated list of workspace repositories to include in work on issue
-i, --issue string            The issue key name. The key will be used to link the work item to the issue. If a name argument is not provided the issue key will be used as the work item name.
```

### SEE ALSO

* [gk](gk.md)	 - GitKraken CLI.