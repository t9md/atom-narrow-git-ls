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

  kickConsumeNarrow() {
    const editor = atom.workspace.getActiveTextEditor()
    atom.commands.dispatch(editor.element, "narrow:activate-package")
  },

  narrow(...args) {
    // HACK: This function is immediately replaced to service.narrow after consumeNarrow

    this.kickConsumeNarrow() // activate narrow and cousumeNarrow

    // now this.narrow === service.narrow
    this.narrow(...args)
  },

  consumeNarrow(service) {
    service.registerProvider("git-ls", require.resolve("./git-ls"))
    this.narrow = service.narrow
  },
}
