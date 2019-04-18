import Listr from 'listr'
import getConfigFile from '../core/get-config-file'
import webhookViber from '../webhooks/viber'
import webhookTelegram from '../webhooks/telegram'

export default async () => {

    const config = getConfigFile()
    
    const tasks = new Listr([
        {
            title: 'Get Wehbook URL',
            task(ctx) {
                if (!config.production) {
                    return Promise.reject(new Error('Add "production" property in "newbot.config.js" file'))
                }
                if (!config.production.webhookUrl) {
                    return Promise.reject(new Error('Add "production.webhookUrl" property in "newbot.config.js" file'.red))
                }
                ctx.url = config.production.webhookUrl
            }
        },
        webhookViber(config, {
            prod: true
        }),
        webhookTelegram(config, {
            prod: true
        })
    ])

    await tasks.run()
}