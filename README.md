<div align="center">
    <img src="https://github.com/topitbopit/RedlinePack/raw/main/logo.png" width="512"></img>
</div>  

# RedlinePack  
**RedlinePack** is an extremely simple Lua file packer. It lets you combine multiple .lua files into a single output through a simple module-like format, where files "import" other files.  

Unlike most other packers, it doesn't do too much processing or modification of your files. This means that your files should be perfectly compatible, no matter what syntax you use.*  

As the name suggests, this was written for the now discontinued [Redline](https://github.com/topitbopit/Redline).  

**Have any questions? Open up an issue on this repo. Contributions are appreciated!**  
<br/>

_*Except if minification is enabled 😅_  
## Alternatives
Even though RedlinePack is super simple to use, it won't be the best tool for everyone. Here's a list of several other Lua packers that you can use in case RedlinePack doesn't work out:  

 - [Tape](https://github.com/Belkworks/tape)  
 - [LuaCompact](https://github.com/Parritz/LuaCompact)  
 - [Le0Dev's luapack](https://github.com/Le0Developer/luapack)  
 - [RobLoach's luapack](https://github.com/RobLoach/luapack)  

## Installation  
RedlinePack is written in javascript and requires Node.js, [which can be found here](https://nodejs.org/en/download/).  

Installation is as simple as downloading the repository, deleting unwanted extra files (e.g. the icon), then running `node packer.js`.  
Alternatively, you can download a "workspace" in the [releases section](https://github.com/topitbopit/RedlinePack/releases) that's already setup for you, making it extremely easy to get started.  

## Usage  

#### Importing  
RedlinePack allows you to import other Lua files into your main program. This is accomplished through three different pseudo-functions:  
- `IMPORT`, which loads in a single file and returns it as a single function. This is the one you're going to use most!  
- `IMPORT_MULTI`, which imports each .lua file within a directory as it's own function, independent of each other.      
- `IMPORT_DIR`, which loads each .lua file within a directory into one single function.  

Before we continue, here's a few quick notes:  
 - **IMPORT_MULTI and IMPORT_DIR can only load .lua files!** If you use .luau or something else, I'm sorry!  
 - **Remember to include the file extension when importing a file!**  
 - **Only IMPORT and IMPORT_MULTI can return values!** If you want to return a value, avoid using IMPORT_DIR.  
 - Don't like the function names? You can change the keywords in the `settings.json` file.  

Importing is done by simply calling the respective function with the file path of the file you'd like to import.  
For example...  
```lua
local test = IMPORT('src/test.lua') -- import a single file called "test.lua"  

local library1, library2 = IMPORT_MULTI('src/libraries/') -- import every .lua file located in src/libraries/ as several variables  

IMPORT_DIR('src/modules/') -- simply run every file located in src/modules/  
```
> Note that these are not actual functions. You can't do something like this; it won't be recognized.  
> ```lua
> local a = 'scr/test.lua'
> local new = IMPORT
> new(a)
> ```

#### Building
Unlike other file packers, RedlinePack is unique in that it doesn't take command line arguments. This helps keep the packer small and less complicated, but probably more annoying to use. Sorry about that.  

In order to change build settings, you must edit the `settings.json` file. Most options are self explanatory, but the full list of them is below.  

**inputFile** - The file to start packing with. Defaults to `"src/main.lua"`  
**outputFile** - The file to "compile" / pack everything into. Defaults to `"compiled.lua"`  

**keywordSingle** - The keyword used for single file imports. Defaults to `"IMPORT"`  
**keywordMulti** - The keyword used for multi file imports. Defaults to `"IMPORT_MULTI"`  
**keywordDirectory** - The keyword used for directory imports. Defaults to `"IMPORT_DIR"`  

**tabLength** - How many spaces each tab is. If you're using `smartIndents`, make sure this value is accurate. Defaults to `4`  
**smartIndents** - Fixes up formatting issues found in very specific cases by applying extra indentation to the packed output. Defaults to `true`  

**redundantImporting** - Lets you import the same file multiple times. RedlinePack can overflow and break if redundant importing is used incorrectly (e.g. file1 imports file2, file2 imports file1), and therefore is very experimental! Defaults to `false`  
**minifyOutput** - Minifies the output with [luamin](https://github.com/mathiasbynens/luamin/tree/master). Smaller file size, but **doesn't support Luau**. Defaults to `false`  

**fileComments** - Adds comments to the end of import statements displaying what file each import is. Defaults to `true`  
**packerWatermark** - Adds a RedlinePack watermark to the top of the final packed file. Defaults to `true`  
**verboseLogs** - Displays extra info logs when enabled. Helpful for debugging. Defaults to `true`  


## Example input / output  
#### Inputs  
*src/main.lua*  
```lua
-- hello from main.lua!
local fi = IMPORT('src/file.lua')
local f1, f2, f3 = IMPORT_MULTI('src/many_files/')
```  
*src/file.lua*  
```lua
local file = true
return file
```
*src/many_files/file1.lua*  
```lua
local file = 1
return file
```
*src/many_files/file2.lua*  
```lua
local file = 2
return file
```
*src/many_files/file3.lua*  
```lua
local file = 3
return file
```
#### Output     
```lua
-- Packed using RedlinePack v1.1.1
-- hello from main.lua!
local fi = (function() -- src/file.lua
    local file = true
    return file
end)()
local f1, f2, f3 = (function() -- src/many_files/file1.lua
    local file = 1
    return file
end)(), (function() -- src/many_files/file2.lua
    local file = 2
    return file
end)(), (function() -- src/many_files/file3.lua
    local file = 3
    return file
end)()
```

## To-do  
 - [ ] Command line arguments  
 - [ ] Custom lua file extensions for IMPORT_DIR and IMPORT_MULTI  
 - [x] Minimization (Done on April 25, 2024. Thanks @RobloxArchiver!)  
 - [x] Multi-file importing (Done on September 3, 2022)  
 - [x] Fix $ string patterns breaking when packing (Done on September 3, 2022)  
 - [x] Fix directory importing breaking if the path doesn't have a slash at the end (Done on September 3, 2022)  
 - [x] More helpful debug info (Done on October 5, 2022)  
 - [x] Ability to disable filepath comments (Done on October 5, 2022)  
 - [x] Ability to enable redundant importing (Done on October 5, 2022)  
 - [x] Extra console output (Done on October 5, 2022)  
 - [x] Intelligent formatting (Done on October 5, 2022)  
 - [x] Readme rewrite (Done on March 9, 2023, done again on April 25, 2024)  
