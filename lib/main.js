const {CompositeDisposable} = require("atom")

const settings = require(atom.packages.resolvePackagePath("narrow") +
  "/lib/settings")

module.exports = {
  config: settings.createProviderConfig({
    autoPreview: false,
    autoPreviewOnQueryChange: false,
    negateNarrowQueryByEndingExclamation: true,
    revealOnStartCondition: "never",
  }),

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.commands.add("atom-text-editor", {
        "narrow:git-ls": () => this.narrow("git-ls"),
      })
    )
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  narrow(...args) {
    if (!this.service) {
      // kick consumeService
      const editor = atom.workspace.getActiveTextEditor()
      atom.commands.dispatch(editor.element, "narrow:activate-package")
    }
    this.service.narrow(...args)
  },

  consumeNarrow(service) {
    service.registerProvider("git-ls", require.resolve("./git-ls"))
    this.service = service
  },
}
