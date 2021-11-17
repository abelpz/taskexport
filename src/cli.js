
import colors from 'colors'
import Conf from 'conf'
import { clickUpMenu } from './modules/cli/clickupMenu.js'
import { dcsMenu } from './modules/cli/dcsMenu.js'



var arg = process.argv.slice(2)[0];

let cli = {}

cli.init = async () => {

    console.clear()
    console.log(colors.blue('\nWelcome to gl-tasks.\n'))
    try {
        await dcsMenu()
        await clickUpMenu()
    } catch (error) {
        console.error(error)
    }
}

cli.clear = () => {
    console.clear()
    const conf = new Conf()
    conf.clear()
    console.log(colors.green("all settings have been cleared. run 'yarn setup' to reset."))
}

if(arg) cli[arg]()
else cli.init()