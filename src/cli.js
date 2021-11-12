import inquirer from 'inquirer'
import Conf from 'conf'
import colors from 'colors'
import axios from 'axios'

import { tsvParse, getTsvFromFile } from './utils/tsv.js'
import { sendTasksTree } from './modules/clickup/sendTree.js'
import { createTasksTree } from './templates/clickup/tw-harmonize/tasksTree.js'


const init = async () => {

    console.clear()

    const conf = new Conf()

    let clickUpAuth = conf.get('clickUpAuth')

    console.log(colors.blue('\nWelcome to gl-tasks.\n'))

    const questions = [
        {
            type: 'list',
            name: 'resource',
            message: 'Select your template',
            choices: ['tw-harmonize']
        },
        {
            type: 'confirm',
            name: 'useToken',
            message: 'A previous ClickUp token has been found, do you wish to use it?',
            default: true,
            when() {
                return clickUpAuth !== undefined
            }
        },
        {
            type: 'input',
            name: 'clickUpToken',
            message: "Add a valid ClickUp Token:",
            when(answers) {
                return !answers.useToken
            }
        }
    ]

    inquirer.prompt(questions).then((answers) => {

        const token = answers.useToken ? clickUpAuth : answers.clickUpToken
        if (token) {
            const apiBase = 'https://api.clickup.com/api/v2/'
            const config = {
                headers: {
                    'Authorization': token
                }
            }
            axios.get(apiBase + 'team', config)
            .then((response) => {
                conf.set('clickUpAuth', token)
                const teams = response.data.teams
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'team',
                        message: 'Select a clickUp team from your account',
                        choices: teams.map( (team) => team.name )
                    }
                ]).then(answers => {
                    axios.get(apiBase + `team/${teams.find((team) => team.name === answers.team).id}/space`, config)
                    .then((response) => {
                        const spaces = response.data.spaces
                        inquirer.prompt([
                            {
                                type: 'list',
                                name: 'space',
                                message: 'Select a space',
                                choices: spaces.map((space) => space.name)
                            }
                        ]).then(answers => {
                            axios.get(apiBase + `space/${spaces.find((space) => space.name === answers.space).id}/folder`, config)
                            .then((response) => {
                                const folders = response.data.folders
                                const foldersNames = folders.map((folder) => folder.name)
                                inquirer.prompt([
                                    {
                                        type: 'list',
                                        name: 'folder',
                                        message: 'Select a folder',
                                        choices: foldersNames,
                                        when() { return foldersNames.length > 0 }
                                    }
                                ]).then(answers => {
                                    if (answers.folder) {
                                        let lists = []
                                        lists = folders.find((folder) => folder.name === answers.folder).lists
                                        inquirer.prompt([
                                        {
                                            type: 'list',
                                            name: 'list',
                                            message: 'Select a list to start adding tasks.',
                                            choices: lists.map((list) => list.name)
                                        }
                                        ]).then(async answers => {
                                            const listId = lists.find(list => list.name === answers.list).id
                                            conf.set('clickUpList', listId)
                                            console.log(colors.green("All necessary params are set up. Run 'yarn start' in your terminal to start sending tasks."))
                                            // const base = './repos'
                                            // const repo = '/es-419_twl'
                                            // const res = '/twl_TIT.tsv'
                                            // const tsv = await getTsvFromFile(base + repo + res)
                                            // const tasksTree = createTasksTree(tsvParse({ tsv }))
                                            // sendTasksTree(tasksTree, 1)
                                        })
                                    } else {
                                        console.log('\nTODO: Handle no folders in space.')
                                        return
                                    }
                                })
                            })
                        })
                    })
                })
            })
            .catch(error => {
                console.log(error.message, '. Invalid token.')
                conf.delete('clickUpAuth')
            })
        }
    })
}
init()