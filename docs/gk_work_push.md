## gk work push

The "push" command pushes changes across all repositories in the active workspace for the current work item.
It ensures that all local changes, including commits and branches, are synchronized with the corresponding remote repositories.

### Usage
```
gk work push [flags]
```

### Examples
```
gk w push
```

### Flags

```
      --create-pr   Create PR after the push. All defaults will be applied.
  -f, --force       Force push to upstream
  -h, --help        help for push
```

### SEE ALSO

* [gk](gk.md)	 - GitKraken CLI.