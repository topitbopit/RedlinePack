/* RedlinePack v1.0.1 */
/* Written by topit for Redline */

// Warning: I know no fucking JS so this code is extremely garbage 

const fs = require('fs')
const path = require('path')

let config
if ( fs.existsSync('settings.json') ) {
    config = JSON.parse(fs.readFileSync('settings.json').toString())
} else {
    config = {
        "keywordSingle": "IMPORT",
        "keywordDirectory": "IMPORT_DIR",
        "keywordMulti": "IMPORT_MULTI",
        
        "tabLength": 4,
        "outputFile": "compiled.lua",
        "inputFile": "src/main.lua"
    }
}

// i love regex
const parenMatch = `\\s*\\(?\\s*(?:'|"|\\[\\[)+(.*)(:?'|"|\\]\\])[\\s\\)]?`
const importDir = new RegExp(config.keywordDirectory + parenMatch, 'g')
const importMulti = new RegExp(config.keywordMulti + parenMatch, 'g')
const importSingle = new RegExp(config.keywordSingle + parenMatch, 'g')

class Packer {
    constructor() {
        this.imported = [] // keeps track of what file directories were already parsed
    }
    
    // returns if this Packer has imported the file 
    isPathImported(file) {
        return this.imported.includes(file)
    }
    
    // Parses any import keywords found in a file, returns formatted contents
    parseFile(filePath) {
        let fileExists = fs.existsSync(filePath) 
        let fileImported = this.isPathImported(filePath)
        
        if ( fileExists && !fileImported ) {
            this.imported.push(filePath)
            
            let contents = fs.readFileSync(filePath).toString()
            let indentLevel1 = ' '.repeat(config.tabLength)
            let indentLevel2 = ' '.repeat(config.tabLength * 2)
            let indentLevel3 = ' '.repeat(config.tabLength * 3)
            
            // Single imports 
            {
                for ( const match of contents.matchAll(importSingle) ) { 
                    // example input: "local a = IMPORT('src/temp.lua')"
                    let statement = match[0] // IMPORT('src/temp.lua')
                    let importPath = match[1] // src/temp.lua
                    
                    let importContents = this.parseFile(importPath)
                    if ( importContents ) {
                        importContents = importContents.split(/\n/).map(function(line) {
                            return indentLevel1 + line
                        }).join('\n')
                        
                        let result = `(function() -- ${ importPath }\n` + importContents + `\nend)()`
                        
                        result = result.replace('$', '$$$$') // i love javascript!!!
                        contents = contents.replace(statement, result)
                    }
                }
            }
            
            // Multi imports 
            {
                for ( const match of contents.matchAll(importMulti) ) { 
                    let statement = match[0]
                    let importPath = match[1]
                    
                    let result = ''
                    
                    let dirFiles = fs.readdirSync(importPath)
                    
                    if ( dirFiles.length == 0 ) {
                        result = `nil -- no files were found in ${importPath}`
                    } else {
                        for ( const file of dirFiles) { 
                            if ( path.extname(file) != '.lua') {
                                continue
                            }
                            
                            let fullPath = importPath + file
                            let importContents = this.parseFile(fullPath)
    
                            if ( importContents ) {
                                importContents = importContents.split(/\n/).map(function(line) {
                                    return indentLevel1 + line
                                }).join('\n')
                                
                                result += `(function() -- ${ fullPath }\n${importContents}\nend)(), `
                            }
                        }
                        
                        result = result.slice(0, -2)
                    }
                    
                    contents = contents.replace(statement, result)
                }
            }
            
            // Directory imports 
            {
                for ( const match of contents.matchAll(importDir) ) { 
                    // example input: "IMPORT_DIR('src/libraries')"
                    let statement = match[0] // IMPORT_DIR('src/libraries')
                    let importPath = match[1] // src/libraries
                    
                    let result = `do \n${ indentLevel1 }(function() -- ${ importPath }\n`
                    
                    let dirFiles = fs.readdirSync(importPath)
                    
                    if ( dirFiles.length == 0 ) {
                        result = `do -- no files were found in ${importPath}\nend\n`
                    } else {
                        for ( const file of dirFiles) { 
                            if ( path.extname(file) != '.lua') {
                                continue
                            }
                            
                            let fullPath = importPath + file
                            let importContents = this.parseFile(fullPath)

                            if ( importContents ) {
                                result += `${ indentLevel2 }do -- ${ fullPath }\n`
                                
                                importContents = importContents.split(/\n/).map(function(line) {
                                    return indentLevel3 + line
                                }).join('\n')
                                
                                result += importContents
                                result += `\n${ indentLevel2 }end\n`
                            }
                        }
                        
                        result += `${ indentLevel1}end)()\nend`
                    }
                    
                    contents = contents.replace(statement, result)
                }
            }
            
            return contents 
        } else {
            if ( fileImported ) {
                console.log(`Already imported file ${filePath}`)
            } else {
                console.log(`Couldn\'t find file ${filePath}`)
            }
            return false 
        }
    }
}

let thisPacker = new Packer()
let output = thisPacker.parseFile(config.inputFile)

fs.writeFileSync(config.outputFile, output)
