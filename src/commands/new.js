import replaceBlankChar from '../utils/link-cli'
import { ncp } from 'ncp'
import fs from 'fs'
import execa from 'execa'
import Listr from'listr'
import inquirer from 'inquirer'
import Handlebars from 'handlebars'
import train from './train'
import jsbeautify  from 'js-beautify'

const beautify = jsbeautify.js

export default async ({ name }) => {

    const directory = process.cwd()
    const pathProject = `${directory}/${name}`

    const {
        mode
    } = await inquirer.prompt([{
        type: 'list',
        name: 'mode',
        message: 'What do you want to integrate into your project?',
        choices: [{
            value: 'basic',
            name: 'Only the basic files'
        }, {
            value: 'complex',
            name: 'Complete Structure (production server, pre-integrated modules, webviews, i18n)'
        }, {
            value: 'custom',
            name: 'Choose the features yourself'
        }]
    }])

    let feactures = []

    if (mode == 'custom') {
        const ret = await inquirer.prompt([{
            type: 'checkbox',
            name: 'feactures',
            message: 'What do you want to integrate into your project?',
            choices: [ 
            {
                value: 'server',
                name: 'Server for production (not useful if you use NewBot Cloud)'
            }, 
            {
                value: 'webviews',
                name: 'Webviews directory'
            }, 
            {
                value: 'i18n',
                name: 'Internationalization'
            }]
        }])
        feactures = ret.feactures
        if (feactures.includes('nlp')) {
            const { nlp } = await inquirer.prompt([{
                type: 'list',
                name: 'nlp',
                message: 'What is your NLP engine ?',
                choices: [{
                    value: 'dialogflow',
                    name: 'DialogFlow'
                }]
            }])
            feactures.push(nlp)
        }
    }
    else if (mode == 'complex') {
        feactures = ['webviews', 'server', 'i18n']
    }

    const tasks = new Listr([
        {
            title: 'Create project',
            task(ctx) {
                ctx.packages = ['newbot', 'newbot-formats']
                return new Listr([
                    {
                        title: 'Create Folder',
                        task() {
                            try {
                                fs.mkdirSync(pathProject)
                            }
                            catch (err) {
                                if (err.code != 'EEXIST') console.log(err)
                            }
                        }
                    },
                    {
                        title: 'Copy and paste templates',
                        task: (ctx) => new Promise((resolve, reject) => {
                            /*ncp(`${__dirname}/../../templates/init`, pathProject, (err) => {
                                if (err) {
                                    return reject(err)
                                }
                                resolve()
                            })*/
                            let obj = {}
                            for (let feacture of feactures) {
                                obj[feacture] = true
                            }
                            const pathTpl = `${__dirname}/../../templates/init`
                            const copy = (filePath) => {
                                let tpl = fs.readFileSync(`${pathTpl}/${filePath}`, 'utf-8')
                                const tplCompiled = Handlebars.compile(tpl)
                
                                tpl = tplCompiled(obj)
                                if (filePath.endsWith('js')) {
                                    tpl = beautify(tpl)
                                }
                                fs.writeFileSync(`${pathProject}/${filePath}`, tpl)
                            }
                            const mkdir = (path) => fs.mkdirSync(`${pathProject}/${path}`)
                           
                            mkdir('bot')
                            mkdir('bot/skills')
                            copy('bot/main.js')
                            copy('bot/main.spec.js')
                            copy('bot/main.converse')
                            copy('package.json')
                            //copy('.gitignore')
                            copy('index.js')
                            copy('emulator.bot')
                            copy('newbot.config.js')
                            if (mode == 'complex') {
                                mkdir('bot/functions')
                            }
                            if (obj.server) {
                                mkdir('server')
                                copy('server/app.js')
                                copy('server/routes.js')
                                ctx.packages = ctx.packages.concat(['express', 'newbot-express'])
                            }
                            if (obj.i18n) {
                                mkdir('bot/languages')
                                copy('bot/languages/en_EN.json')
                                copy('bot/languages/fr_FR.json')
                                copy('bot/languages/index.js')
                            }
                            if (obj.webviews) {
                                mkdir('webviews')
                                copy('webviews/test.html')
                            }
                            mkdir('bot/skills/hello')
                            copy('bot/skills/hello/hello.converse')
                            copy('bot/skills/hello/hello.js')
                            copy('bot/skills/hello/hello.spec.js')
                            resolve()

                        })
                    }
                ], {concurrent: true});
            }
        },
        {
            title: 'Install package dependencies with npm',
            task: (ctx) => execa.shell(`cd ${replaceBlankChar(pathProject)} && npm install ${ctx.packages.join(' ')}`)
        },
        {
            title: 'Create NLP Model',
            task() {
                return train({
                    onlyTasks: true, 
                    path: pathProject
                })
            }
        }
    ])

    await tasks.run()
    console.log('your project has been generated. Type "newbot serve" to test in an emulator'.green)
}