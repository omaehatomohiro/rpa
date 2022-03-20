'use strict';
const path   = require('path');
require('dotenv').config({ path: path.resolve(__dirname,'.env')})

const {program} = require('commander');

const commandsLoader = require('./lib/commands');

// 全てのコマンドをロード → programに登録
commandsLoader.registerCommands(program);

program.parse(process.argv)
