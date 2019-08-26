import Mocha from 'mocha'
import {
    sync
} from 'glob'
import runSkill from '../build/run-skill'

export default ({ timeout = 5000 } = {}) => {

    if (timeout == 0) timeout = false

    runSkill()

    const directory = process.cwd()
    const mocha = new Mocha({
        timeout
    })

    const testFiles = sync(`${directory}/bot/**/*.spec.js`, {
        ignore: '**/node_modules/**'
    })
    testFiles.forEach(file => mocha.addFile(file))
    mocha.run(failures => process.on('exit', () => process.exit(failures)))
}