## gk workspace set

The set command is used to select the default workspace. This simplifies workflows by allowing commands to operate on
the default workspace without requiring explicit workspace specification.

This command sets the specified workspace as the default for the gk system. Once set, any subsequent commands that
require a workspace will use the default unless another workspace is explicitly specified.

To obtain the default workspace use 'gk ws list'

### Usage
```
gk workspace set [flags]
```

### Examples
```
gk ws set <name>
```

### Flags

```
-h, --help   help for set
```

### SEE ALSO

* [gk workspace](gk_workspace.md)	 - The gk workspace command suite is designed to help developers manage and perform bulk actions across multiple repositories grouped within a workspace.