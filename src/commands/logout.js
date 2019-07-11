import fs from 'fs'
import colors from 'colors'

export default () => {
    const env = process.env.NODE_ENV
    return new Promise(async (resolve, reject) => {
        const cloudFile = __dirname + '/../../.newbot-cloud' + (env ? '-' + env : '')
        try {
            fs.unlinkSync(cloudFile, 'utf-8')
            console.log('[NewBot Cloud] You are disconnected'.green)
            resolve()
        } catch (err) {
            if (err.code == 'ENOENT') {
                console.log('Can not log out because you are not logged in'.red)
            }
            else {
                console.log(err.message.red)
            }
            reject(err)
        }
    })
}