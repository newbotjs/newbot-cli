import { ConverseTesting, bot, user } from 'newbot/testing'
import helloSkill from './hello'

describe('Hello Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting(helloSkill, {
            model: __dirname + '/../../model/model.nlp'
        })
        userConverse = converse.createUser({
            session: {
                message: {
                    source: 'website'
                }
            }
        })
    })

    it('User says "Hello"', () => {
        return userConverse.conversation(
            user `Hello`,
            bot `Hey !`
        )
    })
})