import { ConverseTesting, bot } from 'newbot/testing'
import mainSkill from './main'

describe('Main Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting(mainSkill)
        userConverse = converse.createUser()
    })

    it('Start Conversation', () => {
        return userConverse.conversation(
            {{#if i18n }}bot `Hello world`{{else}}bot `hello world`{{/if}}
        )
    })
})