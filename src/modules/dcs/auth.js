import axios from "axios"

export const authenticate = async (username, password) => {
    const url = `https://git.door43.org/api/v1/users/${username}/tokens`
    const base64encodedData = Buffer.from(username + ':' + password).toString('base64')
    const config = {
        headers: {
            'Authorization': 'Basic ' + base64encodedData
        }
    }
    const body = {
        "name": "gl-tasks"
    }
    try {
        await axios.post(url, body, config)
        .then( (auth) => {console.log(auth.data)} )
            .catch(error => {
                console.log('error en request: ', error.toJSON());
                throw error
            });
    } catch(err) {
        console.log(err)
    }
}