import test from 'ava'
import fs from 'fs'
import _ from 'lodash'
import train from '../src/commands/train'

test('Test Train Steps', async t => {
	const dir = __dirname + '/bot-lang'
	await train({
		path: dir
	})
	const content = fs.readFileSync(dir + '/bot/model/model.nlp', 'utf-8')
	const json = JSON.parse(content)
	t.deepEqual(_.get(json, 'nluManager.locales'), ['en', 'fr'])
})


test('Test Train Steps, but no languages', async t => {
	const dir = __dirname + '/bot-intent'
	await train({
		path: dir
	})
	const content = fs.readFileSync(dir + '/bot/model/model.nlp', 'utf-8')
	const json = JSON.parse(content)
	t.deepEqual(_.get(json, 'nluManager.locales'), ['en'])
})