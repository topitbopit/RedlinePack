<div align="center">
	<img src="https://github.com/topitbopit/RedlinePack/raw/main/logo.png" width="512"></img>
</div>  

# RedlinePack
**RedlinePack** is an extremely simple Lua file packer. It lets you combine multiple .lua files into a single output file in a module like format, where files can "require" other files.  

Unlike most other packers, it doesn't do very much file processing, minification, or any modification of your files. This means that your files should be perfectly compatible, no matter what syntax you use.  

As the name suggests, this was written for [Redline](https://github.com/topitbopit/Redline).  

**Have any questions? DM me  at topit#4057 or open up an issue.**  
## Alternatives
Even though RedlinePack is super simple to use, it won't be the best tool for everyone. Here's a list of several other Lua packers that you can use in case RedlinePack doesn't work out:  

 - [Tape](https://github.com/Belkworks/tape)  
 - [Lua-pack](https://github.com/Bork0038/lua-pack) (discontinued?)  
 -  [LuaCompact](https://github.com/Parritz/LuaCompact)  
 - [Le0Dev's luapack](https://github.com/Le0Developer/luapack)  
 - [RobLoach's luapack](https://github.com/RobLoach/luapack)  

## Installation
RedlinePack is written in JS and requires Node, [which can be found here](https://nodejs.org/en/download/).  

Installation is as simple as downloading the repository and running `node packer.js`.  
Make sure that `settings.json` is located in the running directory.  

> By default, RedlinePack will use `src/main.lua` as input and output a file called `compiled.lua`. If you want to change these settings, modify `settings.json` !  

## Usage  

RedlinePack lets you import files in 3 different ways:  
- IMPORT, which imports a single file  
- IMPORT_MULTI, which imports each file in a directory independent of each other  
- IMPORT_DIR, which runs each file in a directory within a single function  

Importing is done by simply calling the respective function.  
For example, if you needed to import a file called 'test.lua', that would be done with  
```lua
local test = IMPORT('src/test.lua')
```
> Make sure to clearly call the function! Doing any trickery like `( IMPORT   )  ( ([[src/test.lua]])  )` will not work!  


## Example

Input `main.lua`:  
```lua
local file = IMPORT('src/file.lua')
print(file.version)

local lib1, lib2 = IMPORT_MULTI('src/lib/')

IMPORT_DIR('src/extra/')
```
Output `compiled.lua`:  
```lua
local file = (function() -- src/file.lua
    return { version = 'v1.0.0' }
end)()
print(file.version)

local lib1, lib2 = (function() -- src/lib/lib1.lua
    local lib1 = {}
    
    function lib1:isLibrary() 
        return true
    end
    
    return lib1
end)(), (function() -- src/lib/lib2.lua
    local lib2 = {}
    
    function lib2:isLibrary() 
        return true
    end
    
    return lib2
end)()

do 
    (function() -- src/extra/
        do -- src/extra/extra1.lua
            print('Hello from extra1.lua!')
        end
        do -- src/extra/extra2.lua
            print('Hello from extra2.lua!')
        end
        do -- src/extra/extra3.lua
            print('Hello from extra3.lua!')
        end
    end)()
end
```


If you're still confused and need to know how to setup a project, take a look at the [example in the RedlinePack repository](https://github.com/topitbopit/RedlinePack/tree/main/example).  

## To-do  

 - [x] Multi-file importing  
 - [x] Fix $ string patterns breaking when packing  
 - [x] Fix directory importing breaking if the path doesn't have a slash at the end  
 - [ ] Command line arguments  
 - [ ] More helpful debug info  
 - [ ] Ability to disable filepath comments  
 - [ ] Ability to enable redundant importing (importing a file multiple times)  
