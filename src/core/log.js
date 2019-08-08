import {
    format,
    createLogger,
    transports
} from 'winston'

const {
    combine,
    timestamp,
    json,
    prettyPrint
} = format
const directory = process.cwd()

export default createLogger({
    format: combine(
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports: [
        new transports.File({
            filename: directory + '/.logs/errors.log',
            level: 'error'
        })
    ]
})