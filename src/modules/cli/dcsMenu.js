import inquirer from 'inquirer'
import Conf from 'conf'
import { authenticate, repoProjects, userOrgs } from '../dcs/api.js'
import colors from 'colors'
import { templates } from '../../templates/clickup/manifest.js'


const conf = new Conf()

const authMenu = async () => {
  
    let dcsAuth = conf.get('dcsAuth')

    if (dcsAuth) {
        const {useCurrentData} = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'useCurrentData',
                message: 'Do you wish to use previous login info?'
            }
        ])

        if (useCurrentData) return dcsAuth

        conf.delete('dcsAuth')
        return await authMenu()
        
    } else {
        const user = await inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Type your Door43 username:'
            },
            {
                type: 'password',
                name: 'password',
                message: 'Enter your password:',
                mask: '*',
                when(answers) {
                    return answers.username
                }
            }
        ])
        if (user.password) {
                const auth = await authenticate(user.username, user.password)
                console.clear()
                dcsAuth = { username: auth.username, ...auth }
                console.info(colors.green('Login successful'))
                conf.set('dcsAuth', dcsAuth)
                return dcsAuth
        } else {
            throw new Error(colors.red('User not authenticated'))
        }
    } 
}


export const dcsMenu = async () => {
    try {
        const auth = await authMenu()
        
        const orgs = await userOrgs(auth.sha1)

        if (orgs.length === 0) return

        console.info(colors.bold('\nSELECTING SOURCE:\n'))

        const org = await inquirer.prompt([
            {
                type: 'list',
                name: 'org',
                message: 'Select an organization',
                choices: orgs.map(org => org.username),
                default: orgs[0].username
            }
        ])
        .then(answers => orgs.find(org => answers.org === org.username))

        const template = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Select a template',
                choices: templates.map(template => template.title)
            }
        ]).then( answers => templates.find(template => answers.template === template.title))

        const {language} = await inquirer.prompt([
            {
                type: 'list',
                name: 'language',
                message: 'Select a language',
                choices: org['repo_languages']
            }
        ])

        if (['twl', 'tn', 'tq'].includes(template.resource)) {
            const projects = await repoProjects({ org: org.username, language, resource: template.resource })
            const project = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'bookCode',
                    message: 'Enter book code (enter s to select from a list)',
                    validate(value) {
                        const valid = value !== '' && value === 's' || projects.some(project => value === project.identifier)
                        return valid || colors.red('Must enter a valid book code.')
                    },
                },
                {
                    type: 'list',
                    name: 'book',
                    message: 'Select a Bible book',
                    choices: projects.map(project => project.title),
                    when(answer) {
                        return answer.bookCode === 's'
                    }
                } 
            ])
            .then(answers => {
                return answers.book
                    ? projects.find(project => project.title === answers.book)
                    : projects.find(project => answers.bookCode === project.identifier)                
            })
            const path = project.path.split('./')[1]

            conf.set('source', {
                org: org.username,
                language,
                template,
                book: project.title,
                path
            })
        } else {
            console.info(colors.yellow('TODO: Add support for markdown resouces'))
        }

    } catch (error) {
        throw error.message
    }
}