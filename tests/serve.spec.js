import test from 'ava'
import fs from 'fs'
import _ from 'lodash'
import serve from '../src/commands/serve'

test('Test Typscript files', async t => {
	const dir = __dirname + '/bot-ts'
	await serve({
        path: dir,
        entry: 'main.ts'
    })
    t.true(true)
})