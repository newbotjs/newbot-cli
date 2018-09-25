import { ConverseTesting, bot, user } from 'newbot/testing'
import helloSkill from './hello'

describe('Main Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting(helloSkill)
        userConverse = converse.createUser()
    })

    it('User says "Hello"', () => {
        return userConverse.conversation(
            user `Hello`,
            bot `Hey !`
        )
    })
})