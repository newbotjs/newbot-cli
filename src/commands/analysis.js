import latestVersion from 'latest-version'

export default async function() {
    const latestNewbot = await latestVersion('newbot')
    return {
        latestNewbot
    }
}