const {Point, Range, BufferedProcess} = require("atom")
const LineEndingRegExp = /\n|\r\n/
const path = require("path")

function runCommand(options) {
  const bufferedProcess = new BufferedProcess(options)
  bufferedProcess.onWillThrowError(({error, handle}) => {
    if (error.code === "ENOENT" && error.syscall.indexOf("spawn") === 0) {
      console.log("ERROR")
    }
    handle()
  })
  return bufferedProcess
}

function requireFrom(pack, path) {
  const packPath = atom.packages.resolvePackagePath(pack)
  return require(`${packPath}/${path}`)
}

const ProviderBase = requireFrom("narrow", "lib/provider/provider-base")

const providerConfig = {
  showLineHeader: false,
  supportReopen: true,
  supportCacheItems: true,
}

const classConfig = {
  configScope: "narrow-git-ls",
}

class GitLs extends ProviderBase {
  constructor(...args) {
    super(...args)
    this.onData = this.onData.bind(this)
    Object.assign(this, providerConfig)
  }

  ls(project, onData, onFinish) {
    let bufferedProcess
    const commandLine = "git ls-files"
    const [command, ...args] = commandLine.split(/ +/)

    const options = {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      cwd: project,
    }

    const stdout = data => onData(project, data)
    const stderr = data => console.warn("error", data)
    const exit = () => onFinish(project)
    runCommand({command, args, stdout, stderr, exit, options})
  }

  onData(project, data) {
    const itemize = line => ({
      filePath: path.join(project, line),
      text: path.join(path.basename(project), line),
      point: new Point(0, 0),
    })

    this.updateItems(
      data.split(LineEndingRegExp).filter(line => line).map(itemize)
    )
  }

  getItems() {
    let finished = 0
    const projects = atom.project.getPaths()
    const onFinish = () => {
      if (++finished === projects.length) this.finishUpdateItems()
    }

    for (let project of projects) {
      this.ls(project, this.onData, onFinish)
    }
  }
}

Object.assign(GitLs, classConfig)
module.exports = GitLs
