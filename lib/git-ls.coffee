{Point, Range, BufferedProcess} = require 'atom'
LineEndingRegExp = /\n|\r\n/
path = require 'path'

runCommand = (options) ->
  bufferedProcess = new BufferedProcess(options)
  bufferedProcess.onWillThrowError ({error, handle}) ->
    if error.code is 'ENOENT' and error.syscall.indexOf('spawn') is 0
      console.log "ERROR"
    handle()
  bufferedProcess

module.exports = (ProviderBase) ->
  class GitLs extends ProviderBase
    @configScope: 'narrow-git-ls'
    @registerProvider(this)

    showLineHeader: false
    supportReopen: false
    supportCacheItems: true

    ls: (project, onData, onFinish) ->
      commandLine = 'git ls-files'
      [command, args...] = commandLine.split(/ +/)

      options =
        stdio: ['ignore', 'pipe', 'pipe']
        env: process.env
        cwd: project

      stdout = (data) -> onData(project, data)
      stderr = (data) -> console.warn("error", data)
      exit = -> onFinish(project)
      bufferedProcess = runCommand({command, args, stdout, stderr, exit, options})

    onData: (project, data) =>
      shortProjectName = path.basename(project)

      items = []
      for line in data.split(LineEndingRegExp) when line
        filePath = path.join(project, line)
        text = path.join(shortProjectName, line)
        point = new Point(0, 0)
        items.push({filePath, text, point})
      @updateItems(items)

    getItems: ->
      finished = 0
      onFinish = (project) =>
        @finishUpdateItems() if ++finished is projects.length

      projects = atom.project.getPaths()
      for project in projects
        @ls(project, @onData, onFinish)
