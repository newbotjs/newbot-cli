import {
    TelegramClient
} from 'messaging-api-viber'
import common from './common'
import _ from 'lodash'


export default function(config, options = {}) {
    let { url, prod } = options
    return {
        title: `Set WebHook to Telegram platform`,
        skip() {
            const telegram = common('telegram', config, options)
            if (_.isString(telegram)) {
                return telegram
            }
            if (!telegram.accessToken) {
                return 'Add "platforms.telegram.accessToken" property in "newbot.config.js" file with authentification token'
            }
        },
        task(ctx = {}) {
            url = ctx.url || url
            const {
                accessToken
            } = config.platforms.telegram
            const client = TelegramClient.connect(accessToken)
            return client.setWebhook(url + `/${prod ? 'webhook' : 'emulator'}/telegram`)
        }
    }
}