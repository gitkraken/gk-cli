## gk work pr create

The pr create command will create a pull request for each repository within the work item that is ahead of master.
The provided title and body will be used for each repository within the work item.  

If you use the AI flag, --ai, a unique title and body will be generated based on the changes made.

### Usage
```
gk work pr create [flags]
```

### Examples
```
gk work pr create --ai
gk work pr create -t "Title of Pull Request" -b "Body of Pull Request"
```

### Flags

```
      --ai             Have AI generate pull request title and body
  -b, --body string    Body of the pull request to be created
  -h, --help           help for create
  -t, --title string   Title of the pull request to be created. If empty, the name of the work item will be used.
```

### SEE ALSO

* [gk](gk.md)	 - GitKraken CLI.