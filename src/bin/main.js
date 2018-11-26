#!/usr/bin/env node

import program from 'yargs'
import updateNotifier from 'update-notifier'
import testCommand from '../commands/test'
import newCommand from '../commands/new'
import serveCommand from '../commands/serve'
import buildCommand from '../commands/build'

import deployCommand from '../commands/deploy'
import logoutCommand from '../commands/logout'
import emulatorCommand from '../commands/emulator'
import generateCommand from '../commands/generate'
import pkg from '../../package.json'

updateNotifier({ pkg }).notify()

program
    .command('test', 'Run units tests', () => { }, testCommand)
    .option('h', { alias: 'help' })
    .argv

program
    .command('new <name>', 'create a new project', () => { }, newCommand)
    .argv

program
    .command('serve', 'start the server', () => { }, serveCommand)
    .option('p', { alias: 'port', describe: 'Listen on port (3000 by default)' })
    .option('n', { alias: 'ngrok', describe: 'Start Ngrok' })
    .option('c', { alias: 'cloud', describe: 'Test your chatbot in NewBot Cloud' })
    .help("?")
    .alias("?", "help")
    .example("$0 serve -p 5000", "Change port to 5000")
    .argv

program
    .command('build', 'build your chatbot skills', () => { }, buildCommand)
    .argv

program
    .command('emulator', 'Run the console emulator', () => { }, emulatorCommand)
    .option('s', { alias: 'source', describe: 'Simulate platform [messenger, line, slack, telegram, viber]' })
    .option('l', { alias: 'lang', describe: 'Set user language (ex: fr_FR, en_EN, es_ES, ...)' })
    .option('sk', { alias: 'skill', describe: 'Test a skill in skills directory' })
    .help("?")
    .alias("?", "help")
    .argv

program
    .command('generate <type> <name>', 'Run the console emulator', () => { }, generateCommand)
    .help("?")
    .alias("?", "help")
    .argv

program
    .command('deploy', 'Deploy your chatbot to NewBot Cloud', () => { }, deployCommand)
    .argv

program
    .command('logout', 'Logout to NewBot Cloud', () => { }, logoutCommand)
    .argv

program
    .option('v', { alias: 'version', describe: 'Displays NewBot CLI version' })
    .argv

process.on('unhandledRejection', (err) => {
    console.log(err)
})

process.on('uncaughtException', function (err) {
    console.log(err)
})