import {
    ConverseTesting,
    user,
    bot
} from 'newbot/testing'
import {{camelCase}} from './{{name}}'

describe('{{sentence}} Skill Test', () => {
    let userConverse, converse

    beforeEach(() => {
        converse = new ConverseTesting({{camelCase}})
        userConverse = converse.createUser({
            session: {
                message: {
                    source: 'website'
                }
            }
        })
    })

    it('Sample Test', () => {
        return userConverse
            .conversation(
                user `test`,
                bot `{{sentence}} skill works !`
            )
    })
})