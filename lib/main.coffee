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

  deactivate: ->
    @subscriptions?.dispose()
    {@subscriptions} = {}

  consumeNarrow: (service) ->
    {ProviderBase, narrow, settings} = service
    @subscriptions = new CompositeDisposable
    require('./git-ls')(ProviderBase)

    @subscriptions.add atom.commands.add 'atom-text-editor',
      'narrow:git-ls': -> narrow('GitLs')
