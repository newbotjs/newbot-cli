import common from './common'
import _ from 'lodash'
import {
    ViberClient
} from 'messaging-api-viber'

export default function(config, options = {}) {
    let { prod } = options
    return {
        title: `Set WebHook to Viber platform`,
        skip() {
            const viber = common('viber', config, options)
            if (_.isString(viber)) {
                return viber
            }
            if (!viber.accessToken) {
                return 'Add "platforms.viber.accessToken" property in "newbot.config.js" file with authentification token'
            }
        },
        task(ctx) {
            const url = ctx.url
            const {
                accessToken
            } = config.platforms.viber
            const client = ViberClient.connect(accessToken)
            return client.setWebhook(url + `/${prod ? 'webhook' : 'emulator'}/viber`)
        }
    }
}