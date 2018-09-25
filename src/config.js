const env = process.env.NODE_ENV

export default {
    urlCloud: !env ? 'https://app.newbot.io' : 'http://localhost:8080'
}