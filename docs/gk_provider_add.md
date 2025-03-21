## gk provider add

Add a provider token. 

Available providers: github, gitlab, jira

### Usage
```
gk provider add [flags]
```

### Examples
```
  gk provider add <provider>
  gk provider add <provider> -t <pat>
  gk provider add jira -t <pat> --jira-email <your_email> --jira-organization <your_organization>
```
### Flags

```
  -h, --help                       help for add
      --jira-email string          Jira email
      --jira-organization string   Jira organization name
  -t, --token string               PAT token
```

### SEE ALSO

* [gk provider](gk_provider.md)	 - Manage integrations with service providers


