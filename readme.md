# NewBot CLI

## Create new project

`newbot new <folder name>`

## Emulator (in terminal)

`newbot emulator`

Options :
* `--source <platform name>` : Test your chatbot on simulated platform. Example : `newbot emulator --source messenger`
* `--lang <lang id>` : Test your chatbot with an specific language. Example : `newbot emulator --lang fr_FR`
* `--skill <skill folder name>` : test a skill present in the `skills` folder. Example : `newbot emulator --skill test`

## Generate Skill

`newbot generate skill <folder name>`

## Run Local Server

Launch a local server and listen to your chatbot on the default port 3000

`newbot serve`

Options :
* `--port <port>` : Launch on another port
* `--ngrok <O or 1>` : Launches ngrok to create a tunnel to the local server. `0` : disable, `1` : enable (by default)

## Unit Tests

`newbot test`

## Build

`newbot build`

## Deploy on NewBot Cloud

`newbot deploy`

## Disconnect from NewBot Cloud

`newbot logout`

