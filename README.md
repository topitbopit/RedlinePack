<div align="center">
	<img src="https://github.com/topitbopit/RedlinePack/raw/main/logo.png" width="512"></img>
</div>  

# RedlinePack
**RedlinePack** is an extremely simple Lua file packer. It lets you combine multiple .lua files into a single output file in a module-like format, where files can "require" other files.  

Unlike most other packers, it doesn't do very much file processing, minification, or any modification of your files. This means that your files should be perfectly compatible, no matter what syntax you use.  

Although this simplicity does bring a few caveats, like how some formatting will likely never be perfect, RedlinePack does try to get close.  

As the name suggests, this was written for [Redline](https://github.com/topitbopit/Redline).  

**Have any questions? Open up an issue on this repo or DM me on Discord at topit#4057.**  
## Alternatives
Even though RedlinePack is super simple to use, it won't be the best tool for everyone. Here's a list of several other Lua packers that you can use in case RedlinePack doesn't work out:  

 - [Tape](https://github.com/Belkworks/tape)  
 - ~~Bork's Lua-pack~~ Now discontinued
 - [LuaCompact](https://github.com/Parritz/LuaCompact)  
 - [Le0Dev's luapack](https://github.com/Le0Developer/luapack)  
 - [RobLoach's luapack](https://github.com/RobLoach/luapack)  

## Installation
RedlinePack is written in JS and requires Node.js, [which can be found here](https://nodejs.org/en/download/).  

Installation is as simple as downloading the repository, deleting unwanted extra files (like the icon), and lastly running `node packer.js`.  
Alternatively, you can download an already setup "workspace" in the [releases section](https://github.com/topitbopit/RedlinePack/releases).  


> By default, RedlinePack will use `src/main.lua` as input and output a file called `compiled.lua`. If you want to change these settings, modify `settings.json` !  

## Usage  

#### Importing
RedlinePack handles importing other files via three different pseudo functions:  
- `IMPORT`, which loads a single file and returns it as a function  
- `IMPORT_MULTI`, which imports each file within a directory as it's own function, independent of each other  
- `IMPORT_DIR`, which loads every file within a directory into one single function  

> Only `IMPORT` and `IMPORT_MULTI` can return values!  

Importing is done by simply calling the respective function with the file path of the file you'd like to import.  
For example...  
```lua
local test = IMPORT('src/test.lua') -- import a single file called "test.lua"  

local library1, library2 = IMPORTMULTI('src/libraries/') -- import every file located in src/libraries/ as two functions  

IMPORTDIR('src/modules/') -- run every file located in src/modules/  
```
> Note that these are not actual functions. You can't do something like this, as it won't be recognized.  
> ```lua
> local a = 'scr/test.lua'
> local new = IMPORT
> new(a)
> ```

#### Building
Unlike other file packers, RedlinePack is unique in that it doesn't take command line arguments. This helps keep the packer small and less complicated, but probably more annoying to use. Sorry about that.  

In order to change build settings, you must edit the `settings.json` file. Most options are self explanatory, but the full list of them is below.  

**inputFile** - the file to start packing with. Defaults to `"src/main.lua"`  
**outputFile** - the file to "compile" / pack everything into. Defaults to `"compiled.lua"`  

**keywordSingle** - the keyword used for single file imports. Defaults to `"IMPORT"`  
**keywordMulti** - the keyword used for multi file imports. Defaults to `"IMPORT_MULTI"`  
**keywordDirectory** - the keyword used for directory imports. Defaults to `"IMPORT_DIR"`  

**tabLength** - how many spaces each tab is. Defaults to `4`  
**smartIndents** - fixes up formatting issues by trying to figure out and apply the current indentation level to the packed output. Defaults to `true`  
> If **smartIndents** is true, make sure that **tabLength** is set to the tab length you use or else the formatting will be applied incorrectly!  

**fileComments** - adds comments to the end of import statements displaying what file each import is. Defaults to `true`  
**packerWatermark** - adds a RedlinePack watermark to the top of the final packed file. Defaults to `true`  
**verboseLogs** - displays extra info logs when enabled, showing what happens in more detail. Defaults to `true`  
**redundantImporting** - lets you import the same file multiple times. RedlinePack will overflow and break if redundant importing is used incorrectly, and therefore is very experimental! Defaults to `false`  
**minify** - minifys the output. Smaller file size + smaller loading times depending on executor. Defaults to `false`
> IMPORT_MULTI and IMPORT_DIR will check to see if you're importing the input file to stop overflows, but this doesn't stop everything. If you use redundantImporting, be careful! 

## Example input / output  
#### Inputs  
*main.lua*  
```lua
-- hello from main.lua!
local fi = IMPORT('src/file.lua')
local f1, f2, f3 = IMPORT_MULTI('src/many_files/')
```  
*file.lua*  
```lua
local file = true
return file
```
*many_files/file1.lua*  
```lua
local file = 1
return file
```
*many_files/file2.lua*  
```lua
local file = 2
return file
```
*many_files/file3.lua*  
```lua
local file = 3
return file
```
#### Output     
```lua
-- Packed using RedlinePack v1.1.0
-- hello from main.lua!
local fi = (function() 
    local file = true
    return file
end)()
local f1, f2, f3 = (function() 
    local file = 1
    return file
end)(), (function() 
    local file = 2
    return file
end)(), (function() 
    local file = 3
    return file
end)()
```
If you're still confused and want to know how to setup a project, take a look at the [releases section](https://github.com/topitbopit/RedlinePack/releases) within the repository.  

## To-do  
 - [ ] Command line arguments  
 - [x] Multi-file importing (Done on September 3, 2022)  
 - [x] Fix $ string patterns breaking when packing (Done on September 3, 2022)  
 - [x] Fix directory importing breaking if the path doesn't have a slash at the end (Done on September 3, 2022)  
 - [x] More helpful debug info (Done on October 5, 2022)  
 - [x] Ability to disable filepath comments (Done on October 5, 2022)  
 - [x] Ability to enable redundant importing (Done on October 5, 2022)  
 - [x] Extra console output (Done on October 5, 2022)
 - [x] Intelligent formatting (Done on October 5, 2022)
 - [x] Readme rewrite (Done on March 9th, 2023)
