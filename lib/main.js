const {CompositeDisposable} = require('atom')

const settings = require(atom.packages.resolvePackagePath('narrow') + '/lib/settings')
let narrow

module.exports = {
  config: settings.createProviderConfig({
    autoPreview: false,
    autoPreviewOnQueryChange: false,
    negateNarrowQueryByEndingExclamation: true,
    revealOnStartCondition: 'never',
    sortByLength: false
  }),

  activate () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'narrow:git-ls': () => {
          if (!narrow) {
            this.forceConsumeNarrow()
          }
          narrow('git-ls')
        }
      })
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  forceConsumeNarrow () {
    atom.commands.dispatch(atom.workspace.getElement(), 'narrow:activate-package')
  },

  consumeNarrow (service) {
    require('./git-ls')(service)
    narrow = service.narrow
  }
}
