print('Hello from main.lua!')

local mainLibrary = IMPORT('src/library.lua') -- IMPORT takes in and loads a single lua file
mainLibrary:doStuff()

local utility1, utility2, utility3 = IMPORT_MULTI('src/utils/') -- IMPORT_MULTI takes in a directory and returns each file in order
print(utility1:isUtility())
print(utility2:isUtility())
print(utility3:isUtility())

IMPORT_DIR('src/extra/') -- IMPORT_DIR takes in a directory and loads every single file in one function; nothing can be returned
