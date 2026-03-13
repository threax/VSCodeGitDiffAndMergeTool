# Git Diff and Merge Tool

Diff and merge tools can be integrated with Git so they are launched with `git difftool -t <fileext> -y <file>` and `git mergetool -t <fileext> -y <file>`. This passes the file extension with . to as the tool to use.

This extension allows you to launch those tools from Visual Studio Code.

## Setup

To register your diff/merge tool with Git you need to edit your `.gitconfig` file:

`git config --global --edit`

For example, this sets up Beyond Compare 4 on Windows:

```
[difftool ".mybinary"]
    cmd = "mybinarydifftool \"$LOCAL\" \"$REMOTE\""
```

## Building
Install vsce
```
npm install -g @vscode/vsce
```

Build vsix
```
vsce package
```

## Changelog

### 1.0.5
2021-10-02
- Added configuration option to disable the notification on launching the tool.
- Added error notification if VSCode fails to provide the command parameter, which can sometimes happen when the merge conflict list is being refreshed.