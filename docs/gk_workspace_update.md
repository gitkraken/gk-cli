## gk workspace update

Update allows you to modify an existing workspace. You can add or remove repositories, update descriptions,
and switch between cloud and local configurations for a workspace.

### Usage
```
gk workspace update [flags]
```
### Examples
```
gk workspace update <name> [flags]
gk ws update <name> [flags]

Example: Add two new repositories to workspace, amazing
gk ws update amazing --add-repos <path>,<path>
```

### Flags

```
    --add-repos strings      Comma-separated list of repositories to add to the workspace
    --azure-org-id string    Set your Azure organization id
    --azure-project string   Set your Azure project name
-c, --cloud                  Convert local workspace to cloud, enabling easier sharing and protecting local work
-d, --description string     New workspace description
-h, --help                   help for update
-n, --name string            Name to update the workspace to
    --remove-repos strings   Comma-separated list of repositories to remove from the workspace
```
### SEE ALSO

* [gk workspace](gk_workspace.md)	 - The gk workspace command suite is designed to help developers manage and perform bulk actions across multiple repositories grouped within a workspace.