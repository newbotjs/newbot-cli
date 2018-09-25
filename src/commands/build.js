import Listr from 'listr'
import build from '../build/main'

const rollup = require('rollup')

export default async () => {
    const path = process.cwd()
    const dist = `${path}/dist`

    const tasks = new Listr([{
            title: 'Build your chatbot for NodeJS',
            async task() {
                const optionsRollup = build({
                    type: 'node'
                })
                const bundle = await rollup.rollup(optionsRollup)
                await bundle.write({
                    format: 'cjs',
                    dir: 'dist/node',
                    file: 'bot.js',
                    strict: false
                })
            }
        },
        {
            title: 'Build your chatbot for browser',
            async task() {
                const optionsRollup = build({
                    type: 'browser'
                })
                const bundle = await rollup.rollup(optionsRollup)
                await bundle.write({
                    format: 'iife',
                    name: 'MainSkill',
                    dir: 'dist/browser',
                    file: 'main.js'
                })
            }
        }
    ])

    tasks.run()

}