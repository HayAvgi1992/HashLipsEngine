const fs = require("fs");
const basePath = process.cwd();
const { changeItemsForSpecificFiles } = require(`${basePath}/src/config.js`);

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
const changeFileAttributes = (itemToChange, fieldsFromConfig, fileName) => {
    itemKeys = Object.keys(itemToChange)
    for (let [configItemKey, configItemValue] of Object.entries(fieldsFromConfig)) {
        if (!itemKeys.includes(configItemKey)) {
            console.warn(`The key: ${configItemKey} doen't exist in file ${fileName}, update failed`)
        } else {
            itemToChange[configItemKey] = configItemValue
        }
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

/**
 * Build metadata file content
 */
const buildMetaDataFile = () => {
    const getUnUpdateFilesNames = jsonFilesNames.filter(jsonFile => !configItemNames.includes(jsonFile) && jsonFile !== "_metadata.json")
    let rawdata

    getUnUpdateFilesNames.forEach(jsonFile => {
        rawdata = fs.readFileSync(`${basePath}/build/json/${jsonFile}`);
        metadataList.push(JSON.parse(rawdata))
    })
}

// main functionality
try {
    // check if there is something to update.
    if (Object.keys(changeItemsForSpecificFiles).length > 0) {
        // update each json file
        for (let [fileName, fileAttributes] of Object.entries(changeItemsForSpecificFiles)) {
            item = getSpecificJsonData(fileName)
            if (item) {
                changeFileAttributes(item, fileAttributes, fileName)
                writeUpdateFile(item)
    
                metadataList.push(item)
                configItemNames.push(fileName)
    
                console.log(`Finish to update "${fileName}" file`)
            }
        }
    
        // buid metadata file content
        buildMetaDataFile()
        // write metadata file content
        writeUpdateFile()
        console.log("Finish to update metadata file.")
    } else {
        console.log("Add to 'changeItemsForSpecificFiles' variable from config.js file what you want to update.")
    }

} catch (e) {
    console.error(`Failed to update files, exception raised `, String(e))
}