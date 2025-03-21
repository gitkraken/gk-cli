## gk work end

The "end" command finalizes a work item, ensuring the workspace is clean and ready for future tasks.
It provides options to delete or preserve local changes, while also removing any temporary setups associated with the work item.
This command helps developers efficiently manage completed tasks and maintain an organized workflow.

### Usage
```
gk work end [flags]
```

### Aliases 
```
end 
delete 
remove 
rm
```

### Examples
```
gk work end <name of work item>
```

### Flags

```
-f, --force   If true, branches will be deleted even if they are not fully merged. Similar to git branch -D flag
-h, --help    help for end
```

### SEE ALSO

* [gk](gk.md)	 - GitKraken CLI.