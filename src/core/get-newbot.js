import { NewBot } from 'newbot'

export default function() {
    const currentPath = process.cwd()
    try {
        const { Converse } = require(currentPath + '/node_modules/newbot')
        return Converse
    }
    catch(err) {
        return NewBot
    }
}