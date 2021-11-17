export const createTasksTree = ({resource,data = {}, filter = []}) => {
    
    //create array to contain task trees
    let tasks = []
    const book = resource[1][0]
    let chapter
    let verse

    //subTask number
    let subCount = 0
    let flag = false
    
    //generate task trees from resource and add them to tasks array
    for (let index = 1; index < resource.length; index++) {
        if (isNaN(resource[index][2])) continue

        
        const prevVerse = verse;
        chapter = resource[index][1]
        verse = resource[index][2]

        const ref = chapter + ':' + verse
        
        if (prevVerse === verse) {
            subCount++
            tasks[tasks.length-1].subtasks.push({
                id: index,
                name: `Check note ${book} ${ref} #${subCount}`,
                description: "For a tNote to pass this process, it must pass the checklists below. If the tNote passes the check, check the item off the list by clicking on the circle to the left of the item.",
                parent: tasks[tasks.length-1].id,
                tags: [resource[index][3]],
                flag: flag,
                checkLists: checkListTypes[0]
            })
        } else {
            if (tasks.length > 0) {
                subCount++
                const subTask = ({
                    id: ref + '/' + subCount,
                    name: `Final check ${book} ${chapter}:${verse-1}`,
                    description: 'To check that this verse has the necessary tNotes do a general review by reading the whole verse again and complete the checklist below. If the answer is "no" to any of the questions in the checklist, you may have to create the new tNotes needed for this verse to pass the checklist.',
                    parent: tasks[tasks.length-1].id,
                    tags: [],
                    flag: flag,
                    checkLists: checkListTypes[1]
                })
                tasks[tasks.length-1].subtasks = [...tasks[tasks.length-1].subtasks, subTask]
            }
            subCount = 1
            tasks = [...tasks, {
                id: ref,
                name: `Check tNotes from ${book} ${ref}`,
                description: "To complete this task, first complete all the checklists for each of the notes in this verse. Start by openning the subtasks below.",
                tags: [`c${chapter}`, `v${verse}`, 'verse'],
                subtasks: [{
                    id: ref + '/' + subCount,
                    name: `Check note ${book} ${ref} #${subCount}`,
                    description: "For a tNote to pass this process, it must pass the checklists below. If the tNote passes the check, check the item off the list by clicking on the circle to the left of the item.",
                    parent: ref,
                    tags: [resource[index][3]],
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
                    name: 'Does the note make sense with the GLT text?',
                    children: []
                },
                {
                    name: 'Is the note useful for translators, so that they know what to do with the translation problem presented in the GLT? (Is the note actionable?)',
                    children: []
                },
                {
                    name: 'Does each AT (alternative translation) fit exactly in the sentence when replacing the fragment?',
                    children: []
                }

            ]
        },
        {
            name: "CHECKLIST USING GST",
            items: [
                {
                    name: 'Does this note adequately explain the GST text?',
                    children: []
                },
                {
                    name: 'Is it useful for the translator to see how the GST "got there" from the GLT?',
                    children: []
                },
                {
                    name: 'When a note refers to the GST, does it make sense with what the GST says?',
                    children: []
                },
            ]
        }
    ],
    [
        {
            name: "CHECKLIST",
            items: [
                {
                    name: "Does each significant difference between the GLT and the GST have a tNote to explain it?",
                    children: []
                },
                {
                    name: "Does each GLT difficulty have a tNote that explains it?",
                    children: []
                },
            ]
        }
    ]
]