const fs = require("fs");
const basePath = process.cwd();
const { updateTraitTypesandValues } = require(`${basePath}/src/config.js`);

let item
let metadataList = []
let configItemNames = []
// get file names of folder build 
let jsonFilesNames = fs.readdirSync(`${basePath}/build/json`)

/**
 * Change field of json file according config inputs.
 * @param {Object} itemToChange: file json object.
 * @param {Object} fieldsFromConfig: config inputs, tell us what to change  
 * @param {String} fileName: the name of the file
 */
const changeFileAttributes = (fileData, fileName) => {
    attributes = fileData.attributes
    if (attributes && attributes.length > 0) {
        for (let [key, value] of Object.entries(updateTraitTypesandValues)) {
            attributes.forEach(field => {

                if (field[key] === value.src) {
                    field[key] = value.dst
                }
            })
        }
    } else {
        console.error(`file ${fileName} doesn't have attributes field!`)
    }
}

/**
 * 
 if there is an item, update it's content to specific file
 else update metadata file.
 */
const writeUpdateFile = (item) => {
    let path
    let fileContent

    if (item) {
        path = `${basePath}/build/json/${item.edition}.json`
        fileContent = item
        // update metadata file
    } else {
        path = `${basePath}/build/json/_metadata.json`
        fileContent = metadataList
    }
    fs.writeFileSync(path, JSON.stringify(fileContent, null, 2))
}

/**
 * @param {String} fileName: The name of the file.
 * @returns files content
 */
const getSpecificJsonData = (fileName) => {
    const path = `${basePath}/build/json/${fileName}`
    if (fs.existsSync(path)) {
        let rawdata = fs.readFileSync(path);
        let data = JSON.parse(rawdata)
        return data
    } else {
        console.error(`Didn't find "${fileName}" file in ${path}.`)
    }

}


// main functionality
try {
    // check if there is something to update.
    if (Object.keys(updateTraitTypesandValues).length > 0) {
        for (let fileName of jsonFilesNames) {
            if (fileName !== "_metadata.json") {
                // update each json file
                fileData = getSpecificJsonData(fileName)
                if (fileData) {
                    changeFileAttributes(fileData, fileName)
                    writeUpdateFile(fileData)

                    metadataList.push(fileData)
                    configItemNames.push(fileName)

                    console.log(`Finish to update "${fileName}" file`)
                }
            }
        }

        // write metadata file content
        writeUpdateFile()
        console.log("Finish to update metadata file.")
    } else {
        console.log("Add data to 'updateTraitTypesandValues' variable from config.js file.")
    }

} catch (e) {
    console.error(`Failed to update files, exception raised `, String(e))
}