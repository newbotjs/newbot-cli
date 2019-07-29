const packages = require('../../package.json')
const stream = require('stream')
const os = require('os')

module.exports = (app, options) => {
    app.get('/log/:index/download', (req, res, next) => {
        const { index } = req.params
        const logs = global.logs[index]

        const serialize = (val) => {
            const clone = Object.assign({}, val)
            clone.user = clone.level = clone.namespace = clone.date = undefined
            return clone
        }

        const json = (val) => {
            return JSON.stringify(val, null, 2)
        }
        
        let fileContents = `
# Versions
- NewBot Frawemork: ${options.Converse.version}
- NewBot CLI :  ${packages.version}

# OS
- Platform : ${os.platform()}
- Arch : ${os.arch()}

# Path
${options.path}

# Trace
- Index : ${index}
`

        for (let i=0 ; i < logs.length ; i++) {
            const log = logs[i]
            const item = JSON.parse(log.val)
            fileContents += `
## Step ${i+1}
- Date : ${log.date}
- Type : ${log.type}
- Skill : ${item.namespace}
- Function : ${item.level}
- User : ${item.user.id}
- Platform : ${item.platform}

### User

\`\`\`json
${json(item.user)}
\`\`\`

### Log

\`\`\`json
${json(serialize(item))}
\`\`\`
`
        }
        
        const readStream = new stream.PassThrough();
        const fileName = 'newbot_log_' + index + '_' + new Date().toJSON() + '.md'
        readStream.end(fileContents)
        res.set('Content-disposition', 'attachment; filename=' + fileName)
        res.set('Content-Type', 'text/plain')
        readStream.pipe(res)
    })
}