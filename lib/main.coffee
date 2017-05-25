{CompositeDisposable} = require 'atom'

requireFrom = (pack, path) ->
  packPath = atom.packages.resolvePackagePath(pack)
  require "#{packPath}/#{path}"

settings = requireFrom('narrow', 'lib/settings')

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
        atom.commands.dispatch(this, 'narrow:activate-package')
        consumeNarrowServicePromise.then (service) ->
          require('./git-ls')
          service.narrow('GitLs')

  deactivate: ->
    @subscriptions?.dispose()
    {@subscriptions} = {}

  consumeNarrow: (service) ->
    @resolveNarrowService(service)
