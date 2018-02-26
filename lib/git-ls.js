const {Point, BufferedProcess} = require('atom')
const LineEndingRegExp = /\n|\r\n/
const Path = require('path')

function runCommand (options) {
  const bufferedProcess = new BufferedProcess(options)
  bufferedProcess.onWillThrowError(({error, handle}) => {
    if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
      console.log('ERROR')
    }
    handle()
  })
  return bufferedProcess
}

module.exports = function loadProvider ({Provider, registerProvider}) {
  class GitLs {
    constructor (state) {
      this.onData = this.onData.bind(this)
      this.provider = Provider.create({
        configScope: 'narrow-git-ls',
        name: this.constructor.name,
        state: state,
        config: {
          showLineHeader: false,
          supportReopen: true,
          supportCacheItems: true
        },
        getItems: this.getItems.bind(this)
      })
    }

    start (options) {
      return this.provider.start(options)
    }

    gitLs (project, onData, onFinish) {
      const commandLine = 'git ls-files'
      const [command, ...args] = commandLine.split(/ +/)

      const options = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
        cwd: project
      }

      const stdout = data => onData(project, data)
      const stderr = data => console.warn('error', data)
      const exit = () => onFinish(project)
      runCommand({command, args, stdout, stderr, exit, options})
    }

    onData (project, data) {
      const itemize = line => ({
        filePath: Path.join(project, line),
        text: Path.join(Path.basename(project), line),
        point: new Point(0, 0)
      })

      this.provider.updateItems(
        data
          .split(LineEndingRegExp)
          .filter(line => line)
          .map(itemize)
      )
    }

    async getItems () {
      let finished = 0
      const projects = atom.project.getPaths()

      let resolveGetItemsPromise
      const getItemPromise = new Promise(resolve => {
        resolveGetItemsPromise = resolve
      })

      const onFinish = () => {
        if (++finished === projects.length) {
          resolveGetItemsPromise()
        }
      }

      for (const project of projects) {
        this.gitLs(project, this.onData, onFinish)
      }

      await getItemPromise
      return []
    }
  }
  GitLs.configScope = 'narrow-git-ls'

  registerProvider('git-ls', GitLs)
}
