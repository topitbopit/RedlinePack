print('Hello from main.lua!')

local mainLibrary = (function() -- src/library.lua
    local library = {}
    
    function library:doStuff() 
        return true
    end
    
    return library
end)() -- IMPORT takes in and loads a single lua file
print(mainLibrary:doStuff())

local utility1, utility2, utility3 = (function() -- src/utils/utility1.lua
    local utility1 = {}
    
    function utility1:isUtility() 
        return true
    end
    function utility1:getUtilId() 
        return 1
    end
    
    return utility1
end)(), (function() -- src/utils/utility2.lua
    local utility2 = {}
    
    function utility2:isUtility() 
        return true
    end
    function utility2:getUtilId() 
        return 2
    end
    
    return utility2
end)(), (function() -- src/utils/utility3.lua
    local utility3 = {}
    
    function utility3:isUtility() 
        return true
    end
    function utility3:getUtilId() 
        return 3
    end
    
    return utility3
end)() -- IMPORT_MULTI takes in a directory and returns each file in order

do 
    (function() -- src/extra/
        do -- src/extra/extra1.lua
            print('Hello from the first extra file')
            -- Returning here would not let the other files import!
        end
        do -- src/extra/extra2.lua
            print('Hello from the second extra file')
        end
        do -- src/extra/extra3.lua
            print('Hello from the third extra file')
        end
    end)()
end -- IMPORT_DIR takes in a directory and loads every single file in one function; nothing can be returned
