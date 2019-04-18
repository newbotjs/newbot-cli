export default function(platform, config, { url, ngrok = false, prod = false }) {
    let p
    if (prod) {
        if (!config.production) {
            return 'Add "production.webhookUrl" in "newbot.config.js" file'
        }
        if (config.production.platforms) {
            p = config.production.platforms[platform]
        }
    }
    else {
        if (!ngrok) {
            return 'ngrok is disabled'
        }
    }
    if (!p) {
        if(!config.platforms) {
            return 'Add "platforms" property in "newbot.config.js" file'
        }
        p = config.platforms[platform]
    }
    if (!p) {
        return `Add "platforms.${platform}" property in "newbot.config.js" file`
    }
    return p
}