## gk workspace create

The gk workspace create command creates a new workspace. Workspaces group multiple repositories, enabling bulk actions and improving developer productivity.

### Usage
```
gk workspace create [flags]
```
### Examples
```
gk ws create
gk ws create <name> --cloud --add-repos <path>,<path>
```

### Options

```
      --add-members strings        Comma-separated list of usernames or emails to add to the workspace
      --add-repos strings          Comma-separated list of repositories to add to the workspace
      --add-teams strings          Comma-separated list of team names to add to the workspace
      --azure-org-id string        Set your Azure organization id
      --azure-project string       Set your Azure project name
  -c, --cloud                      Recommended. Create a cloud-based workspace, enabling easier sharing and protecting local work
  -d, --description string         Set the description of the new workspace
  -h, --help                       help for create
      --organization-name string   Set the organization of the new workspace
      --root-path string           Root directory where all subdirectories will be added to the workspace (default "r")
```

### SEE ALSO

* [gk workspace](gk_workspace.md)	 - The gk workspace command suite is designed to help developers manage and perform bulk actions across multiple repositories grouped within a workspace.

