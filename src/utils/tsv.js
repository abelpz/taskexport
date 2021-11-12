import fs from 'fs'
import path from 'path'

export const getTsvFromFile = async filePath => {
    if (path.extname(filePath) !== '.tsv') return

    const tsv = new Promise((resolve,reject) => {
        fs.readFile(filePath, 'utf-8', async function (err, content) {
            if (err) {
                reject(err)
                return
            }        
            resolve(content)
        })
    });
    return await tsv;
}

export const tsvParse = ({tsv}) => {
  try {
    return tsv.trim().split('\n').map(row => row.trim().split('\t'));
  } catch(error) {
    return null;
  }
};