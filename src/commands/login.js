import rp from 'request-promise'
import fs from 'fs'
import inquirer from 'inquirer'
import colors from 'colors'
import config from '../config'
import isEmail from 'validator/lib/isEmail'

export default () => {
    const env = process.env.NODE_ENV
    return new Promise(async (resolve, reject) => {
        const cloudFile = __dirname + '/../../.newbot-cloud' + (env ? '-' + env : '')
        try {
            const configCloud = fs.readFileSync(cloudFile, 'utf-8')
            resolve(JSON.parse(configCloud))
        } catch (err) {
            if (err.code == 'ENOENT') {
                let retCloud
                const {
                    mode
                } = await inquirer.prompt([{
                    type: 'list',
                    name: 'mode',
                    message: 'NewBot Cloud : To deploy, please login or create an account. It\'s free :)',
                    choices: [{
                        value: 'login',
                        name: 'Login'
                    }, {
                        value: 'signup',
                        name: 'Create an account'
                    }]
                }])
                if (mode == 'login') {
                    const body = await inquirer.prompt([{
                        type: 'input',
                        name: 'username',
                        message: 'Your email'
                    }, {
                        type: 'password',
                        name: 'password',
                        message: 'Your password'
                    }])
                    try {
                        retCloud = await rp({
                            url: `${config.urlCloud}/api/me/login`,
                            method: 'POST',
                            body,
                            json: true
                        })
                    } catch (err) {
                        console.log(err.message.red)
                        if (err.statusCode && err.statusCode == 401) {
                            console.log('Impossible to connect. Verify your email or password'.red)
                        }
                        reject(err)
                    }
                } else if (mode == 'signup') {
                    const body = await inquirer.prompt([{
                        type: 'input',
                        name: 'email',
                        message: 'Your email',
                        validate(input) {
                            if (!isEmail(input)) {
                                return 'Email is invalid'
                            }
                            return true
                        }
                    }, {
                        type: 'password',
                        name: 'password',
                        message: 'Your password'
                    }, {
                        type: 'password',
                        name: 'confirm_password',
                        message: 'Confirm your password'
                    }, 
                    {
                        type: 'confirm',
                        name: 'cgu',
                        message: 'I downloaded and approved the Terms of Service of NewBot.io : https://app.newbot.io/assets/pdf/cgu_en.pdf'
                    }])
                    try {
                        if (!body.cgu) {
                            console.log('[NewBot Cloud] You must accept the terms of use before creating an account'.red)
                            return
                        }
                        retCloud = await rp({
                            url: `${config.urlCloud}/api/users`,
                            method: 'POST',
                            body,
                            json: true
                        })
                        console.log('[NewBot Cloud] Great, your account has been created'.green)
                        resolve(ret)
                    } catch (err) {
                        if (err.message = 'EMAIL_EXISTS') {
                            console.log('This email address already exists. Please use another'.red)
                        } else {
                            console.log(err.message.red)
                        }
                        reject(err)
                    }
                }

                if (retCloud && retCloud.token) {
                    const configCloud = {
                        userToken: retCloud.token
                    }
                    fs.writeFileSync(cloudFile, JSON.stringify(configCloud))
                    resolve(configCloud)
                } else {
                    reject(new Error('Token not found'))
                }

            }
        }
    })
}