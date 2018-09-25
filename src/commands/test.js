import Mocha from 'mocha'
import {
    sync
} from 'glob'

export default () => {
    const directory = process.cwd()
    const mocha = new Mocha()

    const testFiles = sync(`${directory}/bot/**/*.spec.js`)
    testFiles.forEach(file =>  mocha.addFile(file))
    mocha.run(failures => process.on('exit', () => process.exit(failures)))
}