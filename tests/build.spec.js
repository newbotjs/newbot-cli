import test from 'ava'
import fs from 'fs'
import _ from 'lodash'
import build from '../src/commands/build'

test('Test Build file', async t => {
	const dir = __dirname + '/bot-build'
	await build({
        path: dir
    })

    const array = [
        'node/bot.js',
        'browser/index.html',
        'browser/skill.js',
        'browser/skill.cjs.js'
    ]

    t.plan(array.length)

    for (let path of array) {
        const bool = fs.existsSync(`${dir}/dist/${path}`)
		t.assert(bool, path)
	}
})