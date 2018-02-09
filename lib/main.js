const {CompositeDisposable} = require('atom')

const settings = require(atom.packages.resolvePackagePath('narrow') + '/lib/settings')
let GitLs

module.exports = {
  config: settings.createProviderConfig({
    autoPreview: false,
    autoPreviewOnQueryChange: false,
    negateNarrowQueryByEndingExclamation: true,
    revealOnStartCondition: 'never'
  }),

  activate () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'narrow:git-ls': () => {
          if (!GitLs) {
            this.forceConsumeNarrow()
          }
          new GitLs().start()
        }
      })
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  forceConsumeNarrow () {
    const editor = atom.workspace.getActiveTextEditor()
    atom.commands.dispatch(editor.element, 'narrow:activate-package')
  },

  consumeNarrow (service) {
    GitLs = require('./git-ls')(service)
  }
}
