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

export default async ({onlyTasks = false, path, entry = 'main.js'} = {}) => {

    let manager
    let cache = []
    const cacheLang = {}
    const converse = new Converse()

    const directory = path || process.cwd()
    const mainSkill = `${directory}/bot/${entry}`

    const skill = await runSkill(mainSkill)
    let languages = []

    const tasks = new Listr([{
            title: 'Extract Intents',
            task() {
                return new Listr([{
                        title: 'Get Intents',
                        async task() {
                            await converse.loadOptions(skill.default)
                            const intents = await converse.getAllIntents()
                            for (let intent of intents) {
                                const langs = _.get(intent, '_skill.lang._list')
                                if (languages) {
                                    languages = [
                                        ...languages,
                                        ...langs.map(lang => lang.split('_')[0])
                                    ]
                                    languages = _.uniq(languages)
                                }
                                let [intentName, utterances] = intent.params
                                if (_.isArray(utterances)) {
                                    utterances = {
                                        en: utterances
                                    }
                                }
                                for (let lang in utterances) {
                                    if (lang[0] == '_') continue
                                    cacheLang[lang] = true
                                    for (let utterance of utterances[lang]) {
                                        cache.push({
                                            params: [lang, utterance, intentName],
                                            converse: intent._skill
                                        })
                                    }
                                }
                            }
                            
                        }
                    },
                    {
                        title: 'Translate',
                        task() {
                            const langFiles = languages
                            let cacheClone = []

                            for (let i = 0 ; i < cache.length ; i++) {
                                let { params } = cache[i]
                                
                                if (params[1][0] != '#') {
                                    cacheClone.push(_.clone(params))
                                    continue
                                }
                                const translateAndMemorize = (instanceLang, langId, text) => {
                                    const translated = instanceLang.translate(text)
                                    cacheClone.push([langId, translated, cache[i].params[2]])
                                }
                                
                                for (let lang of langFiles) {
                                    let langId = lang
                                    const text = params[1].substr(1)
                                    const instanceLang = cache[i].converse.lang
                                    const fullLang = langId + '_' + langId.toUpperCase()
                                    instanceLang.set(fullLang)
                                    const group = instanceLang.getGroup(text)
                                    if (group.length > 0) {
                                        for (let gtext of group) {
                                            translateAndMemorize(instanceLang, langId, gtext)
                                        }
                                    }
                                    else {
                                        translateAndMemorize(instanceLang, langId, text)
                                    }
                                }
                            }
                            for (let lang of langFiles) {
                                cacheLang[lang] = true
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