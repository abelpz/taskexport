export const createTasksTree = twl => {
    
    //create array to contain task trees
    let tasks = []
   
    let chapter
    let verse

    let subCount = 0
    let words = []
    
    //generate task trees from resource and add them to tasks array
    for (let index = 1; index < twl.length; index++) {
        let flag = true //true if the word is repeated
        const word = twl[index][5].match(/(?<=\/bible\/.*\/).*/)[0]
        if (!words.includes(word)) {
            words = [...words, word]
            flag = false
        }
        const prevVerse = verse;
        const ref = twl[index][0].split(':')
        chapter = ref[0]
        verse = ref[1]
        if (prevVerse === verse) {
            subCount++
            tasks[tasks.length-1].subtasks.push({
                id: index,
                name: `Check word TIT ${twl[index][0]} #${subCount}`,
                description: "For a tW to pass this process, it must pass the checklists below. If the tW passes the check, check the item off the list by clicking on the circle to the left of it, otherwise decide what action to take by checking the sub-list",
                parent: tasks[tasks.length-1].id,
                tags: [word],
                flag: flag,
                checkLists: checkListTypes[0]
            })
        } else {
            if (index > 1) {
                subCount++
                const subTask = ({
                    id: index,
                    name: `Final check TIT ${chapter}:${verse-1}`,
                    description: 'To check that this verse has the necessary tW article do a general review by reading the whole verse again and complete the checklist below. If the answer is "no" to any of the questions in the checklist, review the sub-checklist and decide what action to take to fulfill the main check.',
                    parent: tasks[tasks.length-1].id,
                    tags: [],
                    flag: false,
                    checkLists: checkListTypes[1]
                })
                tasks[tasks.length-1].subtasks = [...tasks[tasks.length-1].subtasks, subTask]
            }
            subCount = 1
            tasks = [...tasks, {
                id: twl[index][0],
                name: `Review words from TIT ${twl[index][0]}`,
                description: "To complete this task, first complete all the checking tasks for each of the tW in this verse.",
                tags: [`c${chapter}`, `v${verse}`, 'verso'],
                subtasks: [{
                    id: index,
                    name: `Check word TIT ${twl[index][0]} #${subCount}`,
                    description: "For a tW to pass this process, it must pass the checklists below. If the tW passes the check, check the item off the list by clicking on the circle to the left of it, otherwise decide what action to take by checking the sub-list.",
                    parent: twl[index][0],
                    tags: [word],
                    flag: flag,
                    checkLists: checkListTypes[0]
                }]
            }]
        }
    }

    return tasks
}

const checkListTypes = [
    [
        {
            name: "CHECKLIST USING GLT",
            items: [
                {
                    name: "Is the definition for this tW (in the article) correct for the TPL context?",
                    children: [
                        {
                            name: "If not, consider whether it is necessary to write a new article to cover this particular meaning of the word.",
                            children: []
                        },
                        {
                            name: "If not, decide whether it is the tW article or the TPL text that needs to be edited.",
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            name: "CHECKLIST USING GST",
            items: [
                {
                    name: 'Is the TPS representation of this tW included as a "translation suggestion" in the article?',
                    children: [
                        {
                            name: "If not, include it",
                            children: []
                        }
                    ]
                }
            ]
        }
    ],
    [
        {
            name: "CHECKLIST",
            items: [
                {
                    name: "Does each difficult word in the TPL have a tW article explaining it?",
                    children: [
                        {
                            name: "If not, search for the item in the tW and add the link, or create the missing tW item in tC Create.",
                            children: []
                        }
                    ]
                }
            ]
        }
    ]
]