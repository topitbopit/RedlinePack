/* RedlinePack v1.1.1 */

const ver = 'v1.1.1'

const fs = require( 'fs' )
const path = require( 'path' )
const luamin = require( 'luamin' )

let config // setting config 
if ( fs.existsSync( 'settings.json' ) ) {
    config = JSON.parse( fs.readFileSync( 'settings.json' ).toString() )
} else {
    config = {
        // import keywords
        "keywordSingle": "IMPORT",
        "keywordDirectory": "IMPORT_DIR",
        "keywordMulti": "IMPORT_MULTI",
        
        // indent stuff
        "tabLength": 4, // how many spaces each "tab" is
        "smartIndents": true,  // fixes indentation breaking in very specific cases
        
        // file input / output
        "outputFile": "compiled.lua",
        "inputFile": "src/main.lua",
        
        // everything else
        "fileComments": true, // includes comments in the output displaying original file locations
        "redundantImporting": false, // lets you import the same file multiple times; this can result in infinite loops when used improperly
        "packerWatermark": true, // adds a packer watermark 
        "verboseLogs": true, // logs more debug information
        "minifyOutput": false // minifies packed output with luamin
    }
    
    fs.writeFileSync( 'settings.json', JSON.stringify( config ) )
}

// console colors 
// i could use chalk but this is less effort 😈 
let tags = {
    'reset': '\x1b[0m',
    'error': `\x1b[38;5;250m[\x1b[38;5;197mERROR\x1b[38;5;250m]\x1b[38;5;161m `,
    'warn': `\x1b[38;5;250m[\x1b[38;5;220mWARNING\x1b[38;5;250m]\x1b[38;5;229m `,
    'info': `\x1b[38;5;250m[\x1b[38;5;231mINFO\x1b[38;5;250m]\x1b[0m `,
    'success': `\x1b[38;5;250m[\x1b[38;5;120mSUCCESS\x1b[38;5;250m]\x1b[0m `,
    'variable': `\x1b[38;5;123m`,
    'red': `\x1b[38;5;197m`,
} 

let logConsole 
if ( config.verboseLogs === true ) {
    logConsole = function ( message ) { 
        console.log( tags.info + message + tags.reset )
    }
} else {
    logConsole = function () {} // this is amazing and definitely not bad practice
}

console.log( tags.red + `RedlinePack ${ ver }\n` + tags.reset )

// funny regexes
const parenMatch = `\\s*\\(?\\s*(?:'|"|\\[\\[)+(.+?)(:?'|"|\\]\\])[\\s\\)]?` // yeah, i know this is awful
const importDir = new RegExp( config.keywordDirectory + parenMatch, 'g' )
const importMulti = new RegExp( config.keywordMulti + parenMatch, 'g' )
const importSingle = new RegExp( config.keywordSingle + parenMatch, 'g' )

// indentation stuff 
let singleTab = ' '.repeat( config.tabLength )

function indentString ( text, indentSize ) {
    let tabs = singleTab.repeat( indentSize )
    
    return text.split( /\n/ ).join( '\n' + tabs ) // theres prob a better method than this but i couldnt find anything
}

// normally i'd inline this but i wont since there'll prob be tons of changes
function getIndentAmnt ( contents, importStatement ) {
    let indentCount = 1
    
    if ( config.smartIndents === true ) {
        let location = contents.indexOf( importStatement ) // the position of the statement  
        
        // i'm sure theres a better method to find the line # a substring is in
        // but i couldn't find any other reliable method
        
        let prevText = contents.substring( 0, location ) // all the text before the statement 
        
        let lines = prevText.split('\n')
        let thisLine = lines[lines.length - 1] // the line 
        
        let tabMatch = thisLine.match( /^([^\S\r\n])*/g )
        
        if ( tabMatch ) {
            let whitespace = tabMatch[0]
            indentCount += whitespace.length / config.tabLength
        }
    }
    
    return indentCount
}

// this is unnecessary but makes the packer source infinitely more easy to understand
class stringBuilder {
    constructor() {
        this.str = ''
    };
    
    indent( amount = 1 ) {
        this.str += `\n${ singleTab.repeat( amount ) }`
        return this
    }
    
    line( text = '' ) {
        this.str += `${ text }\n`
        return this 
    }
    
    text( text ) {
        this.str += text
        return this 
    }
    
    reset() {
        this.str = ''
        return this 
    }
    
    result() {
        return this.str
    }
}

// the packer class is unnecessary but also makes things easier (atleast for me) so im leaving it in
class Packer {
    constructor() {
        this.imported = [] // keeps track of what file directories were already parsed
    }
    
    // Returns if this Packer has imported the file 
    isPathImported( file ) {
        return ( config.redundantImporting ? false : this.imported.includes( file ) )
    }
    
    // Parses any import keywords found in a file, returns formatted contents
    parseFile( filePath ) {
        let fileExists = fs.existsSync( filePath ) 
        let fileImported = this.isPathImported( filePath )
        let fileIsFile = fileExists && fs.lstatSync( filePath ).isFile()
        
        if ( !fileExists ) { 
            console.log( tags.error + `Failed to find the file "${ filePath }"` )
            
            return {
                'status': false,
                'result': 1
            }
        }
        if ( fileImported && !config.redundantImporting ) {
            console.log( tags.warn + `File "${ filePath }" was already imported` )
            
            return {
                'status': false,
                'result': 2
            }
        } 
        if ( !fileIsFile ) {
            console.log( tags.error + `Attempted to import the directory "${ filePath }"` )
            
            return {
                'status': false,
                'result': 3
            }
        }
        
        this.imported.push( filePath )
        
        let contents = fs.readFileSync( filePath ).toString()
        let builder = new stringBuilder() 
        
        // Single imports (rewritten)
        {
            for ( const match of contents.matchAll( importSingle ) ) { 
                let importStatement = match[0] // the entire import statement ( ex. a('b/c.lua') )
                let importPath = match[1] // the file path within the statement ( ex. b/c.lua )
                
                let indentCount = getIndentAmnt( contents, importStatement )
                
                let { status, result } = this.parseFile( importPath )
                
                if ( !status ) {
                    builder.text( '(function() end)() -- ' )
                    
                    switch ( result ) {
                        case 1:
                            builder.text( `Failed to find the file "${ importPath }"` )
                            break;
                        case 2: 
                            builder.text( `File "${ importPath }" was already imported` )
                            break;
                        case 3:
                            builder.text( `Attempted to import a directory ("${ importPath }"), which is not a file!` )
                            break;
                        default: 
                            builder.text( `An unknown error occured - "${ importPath }"` )
                            break;
                    }
                    
                    contents = contents.replace( importStatement, builder.result() )
                    builder.reset()
                    
                    continue 
                }
                
                let importCnts = indentString( result, indentCount )
                builder.text( '(function() ' )
                if ( config.fileComments ) {
                    builder.text( `-- ${ importPath }` )
                }
                builder.indent( indentCount )
                builder.text( importCnts )
                builder.indent( indentCount - 1 ).text( 'end)()' )
                
                let finalStr = builder.result().replaceAll( '$', '$$$$' ) // i love javascript!!
                contents = contents.replace( importStatement, finalStr )
                
                builder.reset()
            }
        };
        
        // Multi imports (rewritten)
        {
            for ( const match of contents.matchAll( importMulti ) ) { 
                let importStatement = match[0] // the entire import statement ( ex. a('b/c.lua') )
                let importPath = match[1] // the file path within the statement ( ex. b/c.lua )
                
                if ( !importPath.endsWith( '/' ) ) {
                    importPath += '/'
                }
                
                if ( !fs.existsSync( importPath ) ) {
                    console.log( tags.error + `Failed to find the directory "${ importPath }"` )
                    
                    builder.text( `(function() end)() -- ` + `Failed to find the directory "${ importPath }"` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                    continue  
                }
                
                if ( fs.lstatSync( importPath ).isFile() ) { 
                    console.log( tags.error + `Attempted to import the file "${ importPath }"` )
                    builder.text( `(function() end)() -- ` + `Attempted to import a file ("${ importPath }"), which is not a directory!` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                    continue  
                }
                
                let indentCount = getIndentAmnt( contents, importStatement )
                let dirFiles = fs.readdirSync( importPath )
                
                if ( dirFiles.length > 0 ) {
                    
                    for ( const file of dirFiles ) {
                        if ( path.extname(file) != '.lua' ) {
                            continue
                        }
                        
                        let fullPath = importPath + file 
                        let { status, result } = this.parseFile( fullPath )
                
                        if ( !status ) {
                            continue 
                        }
                        
                        let importCnts = indentString( result, indentCount )
                        
                        builder.text( '(function() ' )
                        if ( config.fileComments ) {
                            builder.text( `-- ${ fullPath }` )
                        }
                        builder.indent( indentCount )
                        builder.text( importCnts )
                        
                        builder.indent( indentCount - 1 ).text( 'end)(), ' )
                    }
                    
                    let finalStr = builder.result().slice( 0, -2 ).replaceAll( '$', '$$$$' )
                    contents = contents.replace( importStatement, finalStr )
                    
                    builder.reset()
                } else {
                    console.log( tags.warn + `No files were found in the directory "${ importPath }"` )
                    
                    builder.text( `(function() end)() -- ` + `No files were found in the directory "${ importPath }"` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                }
            }
        };
        
        // Directory imports (rewritten)
        {
            for ( const match of contents.matchAll( importDir ) ) { 
                let importStatement = match[0] // the entire import statement ( ex. a('b/c.lua') )
                let importPath = match[1] // the file path within the statement ( ex. b/c.lua )
                
                if ( !importPath.endsWith( '/' ) ) {
                    importPath += '/'
                }
                
                if ( !fs.existsSync( importPath ) ) {
                    console.log( tags.error + `Failed to find the directory "${ importPath }"` )
                    
                    builder.text( `(function() end)() -- ` + `Failed to find the directory "${ importPath }"` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                    continue  
                }
                
                if ( fs.lstatSync( importPath ).isFile() ) { 
                    console.log( tags.error + `Attempted to import the file "${ importPath }"` )
                    builder.text( `(function() end)() -- ` + `Attempted to import a file ("${ importPath }"), which is not a directory!` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                    continue  
                }
                
                let indentCount = getIndentAmnt( contents, importStatement )
                let dirFiles = fs.readdirSync( importPath )
                
                if ( dirFiles.length > 0 ) {
                    builder.text( 'do ' )
                    if ( config.fileComments ) {
                        builder.text( `-- ${ importPath }` )
                    }
                    
                    for ( const file of dirFiles ) {
                        if ( path.extname( file ) != '.lua' ) {
                            continue
                        }
                        
                        let fullPath = importPath + file 
                        if ( fullPath == config.inputFile ) {
                            console.log( tags.warn + 'Attempted to recursively import the input file!' + tags.reset )
                            continue
                        }
                        
                        let { status, result } = this.parseFile( fullPath )
                
                        if ( !status ) {
                            continue 
                        }
                        
                        let importCnts = indentString( result, indentCount + 1 )
                        
                        builder.indent( indentCount ).text( 'do ' )
                        if ( config.fileComments ) {
                            builder.text( `-- ${ fullPath }` )
                        }
                        builder.indent( indentCount + 1 )
                        builder.text( importCnts )
                        
                        builder.indent( indentCount ).text( 'end' )
                    }
                    builder.indent( indentCount - 1 ).text( 'end' )
                    
                    let finalStr = builder.result().replaceAll( '$', '$$$$' )
                    contents = contents.replace( importStatement, finalStr )
                    
                    builder.reset()
                } else {
                    console.log( tags.warn + `No files were found in the directory "${ importPath }"` )
                    
                    builder.text( `(function() end)() -- ` + `No files were found in the directory "${ importPath }"` )
                    contents = contents.replace( importStatement, builder.result() )
                    
                    builder.reset()
                }
            }
        };
        
        logConsole( `Parsed file "${ filePath }"` )
        
        return {
            'status': true,
            'result': contents
        }
    };
};

if ( config.redundantImporting ) {
    console.log( tags.warn + 'RedundantImporting is experimental, and may be unstable!' + tags.reset )
}


let thisPacker = new Packer()
logConsole( 'Created new Packer' )

let { status, result } = thisPacker.parseFile( config.inputFile )
logConsole( 'Finished packing' )

let minifyWorked = false // minification state is stored here in case some error happens
if ( config.minifyOutput === true ) {
    console.log( tags.info + 'Minifying output' + tags.reset )
    
    try {
        let minified = luamin.minify( result )
        result = minified
        minifyWorked = true 
    } catch ( error ) {
        console.log( tags.warn + 'Minification failed; using default output instead' + tags.reset )
        
        logConsole( 'Error from luamin: ' + tags.red + `"${ error }"` ) 
    }
}

if ( config.packerWatermark === true ) {
    let prefix = `-- Packed using RedlinePack ${ ver }\n`
    
    if ( minifyWorked === true ) {
        prefix += '\n' // Extra spacing to make it look clean 😎
    }
    result = prefix + result
}

fs.writeFileSync( config.outputFile, result )

console.log( tags.success + `Successfully packed ${ tags.variable + ( thisPacker.imported.length ) + tags.reset } file(s) into ${ tags.variable + config.outputFile + tags.reset  }.` )
