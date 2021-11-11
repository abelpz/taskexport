import fs from 'fs'
import path from 'path'
import { tsvParse } from './res/helpers.js'
import { sendTasksTree } from './res/tw/send.clickup.js';
import { createTasksTree } from './res/tw/tasksTree.js'

const getTsv = async filePath => {
   
    if (path.extname(filePath) !== '.tsv') return

    const tsv = new Promise((resolve,reject) => {
        fs.readFile(filePath, 'utf-8', async function (err, content) {
            if (err) {
                console.error(err)
                reject(err)
                return
            }        
            resolve(content)
        })
    });
    return await tsv;
}

const init = async () => {

    const base = './repos'
    const repo = '/es-419_twl'
    const res = '/twl_TIT.tsv'

    const tsv = await getTsv(base + repo + res)
    const tasksTree = createTasksTree(tsvParse({ tsv }))
    sendTasksTree(tasksTree, 1)
}
init()