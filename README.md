# tasksExport PoC

Create tasks for translating and checking unfoldingWord resources and export them to clickUp.

Install dependencies by running ```yarn``` in your terminal.

To test this script run ```yarn start``` in your terminal.

You wil need the id of the clickUp list where you want the tasks to be added, and the token from your clickup app. See: <https://clickup20.docs.apiary.io/#introduction/authentication>

Add both params to the ```token``` and ```listId``` constants in [checking.sendTW.js](./res/checking.sendTW.js)
