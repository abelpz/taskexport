import axios from "axios"
import YAML from 'yaml'

const baseUrl = 'https://git.door43.org'
const apiUrl = baseUrl + '/api/v1'

export const authenticate = async (username, password) => {
    const url = `${apiUrl}/users/${username}/tokens`
    const base64encodedData = Buffer.from(username + ':' + password).toString('base64')
    const config = {
        headers: {
            'Authorization': 'Basic ' + base64encodedData
        }
    }
    const body = {
        "name": "gl-tasks"
    }

    return await axios.post(url, body, config)
                .then( (auth) => auth.data )
                .catch(error => {
                    //console.log('error en request: ', error.toJSON());
                    throw error.toJSON()
                });
}

export const userOrgs = async (token) => {
    const url = `${apiUrl}/user/orgs`
    const config = {
        headers: {
            accept: 'application/json',
            Authorization: 'token ' + token
        }
    }
    return await axios(url, config)
                .then( (orgs) => orgs.data )
                .catch(error => {
                    //console.log('error en request: ', error.toJSON());
                    throw error.toJSON()
                });
}

export const repoProjects = async ({org, language, resource}) => {
    return await getFile({org, language, resource, path: 'manifest.yaml'})
                .then((manifest) =>  YAML.parse(manifest).projects )
}

export const getFile = async ({ org, language, resource, path }) => {
    const url = `${baseUrl}/${org}/${language}_${resource}/raw/branch/master/${path}`
    return await axios(url)
                .then((response) =>  response.data )
}