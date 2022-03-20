'use strict';

const log4js = require('log4js');

log4js.configure({
    appenders: {
        scraping: {
            type: "file",
            filename: __dirname + "../../../logs/scraping.log",
            pattern: '-yyyy-MM-dd',
        },
        out:{
          type: "stdout",
        },
    },
    categories: {
        default: {
          appenders: ["scraping","out"], level: "info" 
        },
    }
});

module.exports = log4js.getLogger();