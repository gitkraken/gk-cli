## gk work commit

The "commit" command simplifies the process of committing changes across multiple repositories in the active work item, ensuring all changes are tracked and versioned properly.

### Usage
```
gk work commit [flags]
```
### Examples
```
gk work commit -m "commit message for all repos with changes in active work item"
gk work commit --ai
```

### Flags

```
      --ai               Have AI generate the commit message
  -h, --help             help for commit
  -m, --message string   The git commit message
```

### SEE ALSO

* [gk](gk.md)	 - GitKraken CLI.