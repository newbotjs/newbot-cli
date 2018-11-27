import _ from 'lodash'
import fs from 'fs'
import execa from 'execa'
import Listr from'listr'
import Handlebars from 'handlebars'

export default async ({ name, type }) => {

    const directory = process.cwd()
    const pathSkills = `${directory}/bot/skills/${name}`

    const tasks = new Listr([
        {
            title: 'Create Skill',
            task() {
                return new Listr([
                    {
                        title: 'Create Folder in ~/bot/skills/',
                        async task() {
                            try {
                                fs.mkdirSync(pathSkills)
                            }
                            catch (err) {
                                if (err.code != 'EEXIST') console.log(err)
                            }
                        }
                    },
                    {
                        title: 'Copy and paste templates',
                        async task() {
                            const pathTpl = `${__dirname}/../../templates/skill`

                            const copy = (ext) => {
                                let tpl = fs.readFileSync(`${pathTpl}/skill.${ext}`, 'utf-8')
                                const tplCompiled = Handlebars.compile(tpl)
                                const sentence = name.split('-').map(n => _.upperFirst(n)).join(' ')
                                tpl = tplCompiled({
                                    name,
                                    camelCase: _.camelCase(name),
                                    sentence
                                })
                                fs.writeFileSync(`${pathSkills}/${name}.${ext}`, tpl)
                            }

                            copy('js')
                            copy('converse')
                            copy('spec.js')
                        }
                    }
                ]);
            }
        }
    ])

    await tasks.run()
    console.log(`Your skill has been generated.`.green)
    console.log(`You can test with "newbot emulator --skill ${name}" command and enter "test" in the chatbot`)
    console.log('Remember to connect the skill to a parent skill (main.js for example)')
}