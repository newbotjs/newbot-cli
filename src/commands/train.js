import {
    Converse
} from 'newbot'
import ExtractIntents from 'newbot/packages/train/extract'
import fs from 'fs'
import Listr from 'listr'
import _ from 'lodash'
import runSkill from '../build/run-skill'
import { fs as nlpFs } from '@nlpjs/request'
import { containerBootstrap } from '@nlpjs/core'
import { Nlp } from '@nlpjs/nlp'
import langAll from '@nlpjs/lang-all'

export default async ({ onlyTasks = false, path, entry = 'main.js' } = {}) => {

    let manager

    const directory = path || process.cwd()
    const mainSkill = `${directory}/bot/${entry}`

    const skill = await runSkill(mainSkill)
    const container = await containerBootstrap()
    container.use(Nlp);
    container.use(langAll)
    const nlp = container.get('nlp')
    nlp.container.register('fs', nlpFs);
    nlp.settings.autoSave = false
    const converse = new Converse(skill.default)
    const extract = new ExtractIntents(converse, nlp)

    const tasks = new Listr([{
        title: 'Extract Intents',
        task() {
            return new Listr([{
                title: 'Get Intents',
                task: extract.getIntents.bind(extract)
            },
            {
                title: 'Translate',
                task: extract.translate.bind(extract)
            },
            {
                title: 'Add Document in manager',
                task() {
                    manager = extract.addDocuments()
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
            return manager.save(`${directory}/bot/model/model.nlp`);
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