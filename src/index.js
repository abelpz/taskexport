import { getFile } from './modules/dcs/api.js'
import { sendTasksTree } from './modules/clickup/sendTree.js'
import { tsvParse } from './utils/tsv.js'
import colors from 'colors'
import Conf from 'conf'

const startFrom = process.argv.slice(2)[0];

const init = async () => {

    const conf = new Conf()
    const source = conf.get('source')
    if (source) {
        const {createTasksTree} = await import(`./templates/clickup/${source.template.path}/tasksTree.js`)
        const tsv = await getFile({ ...source, resource: source.template.resource })      
        const tasksTree = createTasksTree(tsvParse({ tsv }), source)

        console.info(colors.cyan(`Sending tasks for ${source.template.title} from ${source.book}`))
        sendTasksTree(tasksTree, isNaN(startFrom) ? 1 : startFrom)
    } else {
        console.warn(colors.yellow("There is no source to generate tasks from. Run 'yarn setup' to set a new source."))
    }

}

init()