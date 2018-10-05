import inquirer from 'inquirer'
import { ncp } from 'ncp'
import fs from 'fs'
import execa from 'execa'
import Listr from'listr'

export default async ({ name }) => {

    const directory = process.cwd()
    const pathProject = `${directory}/${name}`

    const tasks = new Listr([
        {
            title: 'Create project',
            task() {
                return new Listr([
                    {
                        title: 'Create Folder',
                        task() {
                            try {
                                fs.mkdirSync(pathProject)
                            }
                            catch (err) {
                                if (err.code != 'EEXIST') console.log(err)
                            }
                        }
                    },
                    {
                        title: 'Copy and paste templates',
                        task: () => new Promise((resolve, reject) => {
                            ncp(`${__dirname}/../../templates/init`, pathProject, (err) => {
                                if (err) {
                                    return reject(err)
                                }
                                resolve()
                            })
                        })
                    }
                ], {concurrent: true});
            }
        },
        {
            title: 'Install package dependencies with npm',
            task: () => execa.shell(`cd ${pathProject} && npm install`)
        }
    ])

    await tasks.run()
    console.log('your project has been generated. Type "newbot serve" to test in an emulator'.green)
}