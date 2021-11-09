import axios from 'axios'

const teamId = ''
const spaceId = ''
const folderId = ''
const listId = ''
const selectedList = listId
const token = ''

let requestsCount = 0
const maxRequestCount = 100
const RequestTimeOut = 6000

const sendToClickUp = async ({path,body,callBack}) => {
    const _baseApi = 'https://api.clickup.com/api/v2/'
    const _token = token
    const _url = _baseApi + path
    const config = {
        headers: {
            'Authorization': token 
        }
    }
    try {
        //callBack() //callBack for tests
        if (requestsCount < maxRequestCount) {
            requestsCount++
            //console.log("Made a Request. requestsCount: ", requestsCount)
            await axios.post(_url, body, config)
            .then( callBack )
                .catch(error => {
                    console.log('error en request: ', error.toJSON());
                    throw error
                });
        } else {
            console.log(`Rate limit reached. Waiting ${RequestTimeOut} ms. to resume...`)
            await new Promise(resolve => setTimeout(resolve, RequestTimeOut));
            requestsCount = 0
            await sendToClickUp({path, body, callBack})
        }
    } catch(err) {
        console.log(err)
    }
}

const createCheckLists = async (checkLists, taskId) => {
    if (checkLists.length > 0) {
        for (const checkList of checkLists) {
            await createCheckList(checkList, taskId)
        }
    }
}

const createCheckList = async (data, taskId) => {
    console.log("------ sending checklist")
    await sendToClickUp({
        path: `task/${taskId}/checklist/`,
        body : {
            name: data.name
        },
        callBack: async response => {
            //console.log(response.data)
            const checkList = response.data.checklist
            //console.log("checklistId: ", checkList.id);
            if(data.items.length > 0)
                await createCheckListItems(data.items, checkList.id)
        }
    })
}

const createCheckListItems = async (items, checkListId) => {
    for (const item of items) {
        await createCheckListItem(item, checkListId )
    }
}

const getItemIdFromName = (name, items) => {
    if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === name){
                return items[i].id
            } else if (items[i].children.length > 0){
                const id = getItemIdFromName(name, items[i].children)
                if(id) return id
            }
        }
    }
}

const createCheckListItem = async (data, checkListId, checkListItemId = null) => {
    console.log("-------- sending checklists item")
    await sendToClickUp({
        path: `checklist/${checkListId}/checklist_item`,
        body : {
            name: data.name,
            parent: checkListItemId
        },
        callBack: async response => {
            //console.log(response.data)
            const checkList = response.data.checklist
            if (data.children.length > 0) {
                for (const child of data.children) {
                    const checkListItemId = getItemIdFromName(data.name, checkList.items)
                    if (checkListItemId) {
                        await createCheckListItem(child, checkListId, checkListItemId)
                    }
                }
            }
        }
    })
}

const sendSubTask = async (subTask, parentId) => {
    console.info("---- sending subtask: ", subTask.id)
    await sendToClickUp({
        path: `list/${selectedList}/task`,
        body : {
            name: subTask.name,
            description: subTask.description,
            tags: subTask.tags,
            status: "POR HACER",
            notify_all: true,
            parent: parentId,
            links_to: null,
            priority: subTask.flag ? 2 : 4
        },
        callBack: async response => {
            //console.log(response.data);
            const newSubTask = response.data;
            await createCheckLists(subTask.checkLists, newSubTask.id)
        }
    })
}

const sendTaskTree = async task => {
    console.info(`-- Sending task ${task.id}`)
    await sendToClickUp({
        path: `list/${selectedList}/task`,
        body : {
            name: task.name,
            description: task.description,
            tags: task.tags,
            status: "POR HACER",
            notify_all: true,
            parent: null,
            links_to: null,
            priority: 4,
        },
        callBack: async response => {
            //console.log(response.data);
            if (task.subtasks.length > 0) {
                const parentData = response.data
                const parentId = parentData.id;
                for (const subtask of task.subtasks) {
                    await sendSubTask(subtask, parentId)
                }
            }
        }
    })
}

export const sendTasksTree = async ( tasks, id = 1, loop = true) => {
    console.info("Sending tasks tree...")
    var BreakException = {};
    try {
        let cont = 0;
        if (loop) {
            const newTasks = tasks.slice(id-1)
            for (const task of newTasks) {
                await sendTaskTree(task)
            }
        } else {
            if(tasks[id-1])
                await sendTaskTree(tasks[id-1])
        }
    } catch (e) {
        if (e !== BreakException) throw e;
    }
}

const sendInterval = (tasksTree, start, interval) => {
    const tasksCount = tasksTree.length
    let index = start

    console.log("id: ",index)
    sendTasksTree(tasksTree, index)
    index++

    let intervalId = setInterval(function () {
        if (index === tasksCount){
            clearInterval(intervalId)
        } else {
            console.log("id: ",index)
            sendTasksTree(tasksTree, index)
            index++
        }
    }, interval);
}

const testRequests = async (numReq) => {
    for (let index = 0; index < numReq; index++) {
        try {
            await sendToClickUp({
            path: '',
            body: {},
            callBack: () => { console.log(`req: ${index}`) }
        })
        } catch(err) {
            console.error(err); // TypeError: failed to fetch
        }
    }
    
}
//testRequests(500)