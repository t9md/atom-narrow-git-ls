# narrow-git-ls

Plugin for [narrow](https://atom.io/packages/narrow).
Provide `git ls` files as item.

![narrow-git-ls](https://raw.githubusercontent.com/t9md/t9md/2f54f7689c534b6cdfcadda28c584d01524ffbc2/img/atom-narrow/provider-git-ls.gif)


## Keymaps

No default keymap. Here is example, set it in your `keymap.cson`

```coffeescript
'atom-text-editor.vim-mode-plus:not(.insert-mode)':
  'ctrl-p': 'narrow:git-ls'
```


## Known issue
Known issue: [works only in `text-editor` scope](https://github.com/t9md/atom-narrow/issues/259)
