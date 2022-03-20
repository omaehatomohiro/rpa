'use strict';

const RegularOrderScraper = require('../../scrapers/RegularOrderScraper.js');
const PrecsModel = require('../../models/Precs');

const cmdObj = {
    name: 'regular',
    description: 'description text',
    func: (args) => executeScraping(args),
    option_1: '-s, --shop_id <number>',
    option_2: '-d, --date <date>',
    option_3: '-m, --headless_mode <bool>'
}

function registerCommand(program){
  program
    .command(cmdObj.name)
    .description(cmdObj.description)
    .action(cmdObj.func)
    .requiredOption(cmdObj.option_1)
    .requiredOption(cmdObj.option_2)
    .option(cmdObj.option_3,'Headress Mode',false);
}


async function executeScraping(args){
    let scraper;
    try{
        const shopData = await getPrecsData(args.shop_id);
        scraper = new RegularOrderScraper(shopData, args.date, args.headless_mode);
        await scraper.exec();
    }catch(e){
        await scraper.output('\n---------------------------------\n' + e + '\n---------------------------------\n');
        process.exitCode = 1;
    }finally{
        await scraper.output('>> scraper exit');
        await scraper.close();
    }
}

async function getPrecsData(id){
    const precsData = await PrecsModel.findByPk(id);
    if(precsData === null) {
        throw new Error('Precs ID is not found');
    }
    return precsData;
}



module.exports = registerCommand;