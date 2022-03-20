'use strict';

const fs = require('fs');
const path = require('path');
// const commandValidation = require('./validation');

function registerCommands(program){
    const commands = loadCommands();
    for(const command of commands){
        command(program);
    }
}

function loadCommands(){

    // get current directory files and directories name  
    const commandDir = fs.readdirSync(__dirname);
    const loadedCommands = [];
    commandDir.map(function(cmdDirName){
        // current dir + dirname
        return path.join(__dirname, cmdDirName);
    }).filter(function(absolutePath){
        // check is directory
        return fs.statSync(absolutePath).isDirectory();
    }).map(function(commandDirectoryPath){
        // require command
        const command = require(commandDirectoryPath);
        // check commnad object schema. Stop precess if there is an error.
        //commandValidation();
        return command;
    }).forEach(function(command){
        loadedCommands.push(command);
        return;
    })
    return loadedCommands;
}

module.exports = {
    registerCommands,
}
