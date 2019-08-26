import { NewBot } from 'newbot'

export default function() {
    const currentPath = process.cwd()
    try {
        const pathNewBot =  require.resolve('newbot', {
            paths: [currentPath]
        })
        const { Converse } = require(pathNewBot)
        return Converse
    }
    catch(err) {
        return NewBot
    }
}