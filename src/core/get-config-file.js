import fs from 'fs'

export default function() {
    const files = process.cwd()
    let config = {}
    try {
        const configFile = `${files}/newbot.config.js`
        fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK)
        config = require(configFile)
    } catch (err) {
        if (err.code != 'ENOENT') console.log(err)
    }

    if (!config.platforms) config.platforms = {}
    if (!config.ngrok) config.ngrok = {}

    return config
}