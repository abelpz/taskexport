import { tsvParse, getTsvFromFile } from './utils/tsv.js'
import { sendTasksTree } from './modules/clickup/sendTree.js'
import { createTasksTree } from './templates/clickup/tw-harmonize/tasksTree.js'

const init = async () => {
    const base = './repos'
    const repo = '/es-419_twl'
    const res = '/twl_TIT.tsv'
    const tsv = await getTsvFromFile(base + repo + res)
    const tasksTree = createTasksTree(tsvParse({ tsv }))
    sendTasksTree(tasksTree, 1)
}

init()