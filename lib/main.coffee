{CompositeDisposable} = require 'atom'

requireFrom = (pack, path) ->
  packPath = atom.packages.resolvePackagePath(pack)
  require "#{packPath}/#{path}"

settings = requireFrom('narrow', 'lib/settings')

narrow = null

module.exports =
  config: settings.createProviderConfig(
    autoPreview: false
    autoPreviewOnQueryChange: false
    negateNarrowQueryByEndingExclamation: true
    revealOnStartCondition: 'never'
  )

  activate: ->
    consumeNarrowServicePromise = new Promise (resolve) =>
      @resolveNarrowService = resolve

    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'narrow:git-ls': ->
        if service?
          narrow('git-ls')
        else
          atom.commands.dispatch(this, 'narrow:activate-package')
          consumeNarrowServicePromise.then ->
            narrow('git-ls')

  deactivate: ->
    @subscriptions?.dispose()
    {@subscriptions} = {}

  consumeNarrow: (service) ->
    {narrow, registerProvider} = service
    registerProvider('git-ls', require.resolve('./git-ls'))
    @resolveNarrowService(service)
