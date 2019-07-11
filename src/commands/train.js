import {
    Converse
} from 'newbot'
import fs from 'fs'
import Listr from 'listr'
import _ from 'lodash'
import {
    NlpManager
} from 'node-nlp'
import runSkill from '../build/run-skill'

export default async (onlyTasks = false, path) => {

    let manager
    let cache = []
    const cacheLang = {}
    const converse = new Converse()

    const directory = path || process.cwd()
    const mainSkill = `${directory}/bot/main.js`

    const skill = await runSkill(mainSkill)
    const languages = skill.default.languages ? skill.default.languages.packages : ['en_EN']

    const tasks = new Listr([{
            title: 'Extract Intents',
            task() {cd 
                return new Listr([{
                        title: 'Get Intents',
                        async task() {
                            await converse.loadOptions(skill.default)
                            const intents = await converse.getAllIntents()
                            for (let intent of intents) {
                                let [intentName, utterances] = intent.params
                                if (_.isArray(utterances)) {
                                    utterances = {
                                        en: utterances
                                    }
                                }
                                for (let lang in utterances) {
                                    cacheLang[lang] = true
                                    for (let utterance of utterances[lang]) {
                                        cache.push([lang, utterance, intentName])
                                    }
                                }
                            }

                        }
                    },
                    {
                        title: 'Translate',
                        task() {
                            const langFiles = Object.keys(languages)
                            let cacheClone = []
                            for (let i = 0 ; i < cache.length ; i++) {
                                let params = cache[i]
                                cacheClone.push(_.clone(params))
                                if (params[1][0] != '#') continue
                                for (let lang of langFiles) {
                                    let langId = lang.split('_')[0]
                                    const translated = converse.lang.translate(params[1].substr(1), lang)
                                    if (cache[i][0] == langId) {
                                        cacheClone[i][1] = translated
                                    }
                                    else {
                                        cacheClone.push([langId, translated, cache[i][2]])
                                    }
                                }
                            }
                            for (let lang of langFiles) {
                                cacheLang[lang.split('_')[0]] = true
                            }
                            cache = cacheClone
                        }
                    },
                    {
                        title: 'Add Document in manager',
                        task() {
                            manager = new NlpManager({
                                languages: Object.keys(cacheLang)
                            })
                            for (let params of cache) {
                                manager.addDocument(...params)
                            }
                        }
                    }
                ])
            }
        },
        {
            title: 'Train Chatbot',
            task() {
                return manager.train()
            }
        },
        {
            title: 'Save Model',
            task() {
                try {
                    fs.mkdirSync(`${directory}/bot/model`)
                } catch (err) {
                    if (err.code != 'EEXIST') console.log(err)
                }
                manager.save(`${directory}/bot/model/model.nlp`);
            }
        }
    ])
    if (onlyTasks) {
        return tasks
    }
    else {
        await tasks.run()
    }
}