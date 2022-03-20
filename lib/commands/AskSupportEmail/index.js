'use strict';

const AskSupportEmailScraper = require('../../scrapers/AskSupportEmailScraper.js');
const Precs = require('../../models/Precs');

const cmdObj = {
    name: 'askSupportEmail',
    description: 'description text',
    func: (args) => executeScraping(args),
    option_1: '-s, --shop_id <number>',
    option_2: '-d, --order_date <date>',
    option_3: '-p, --product_code <text>',
    option_4: '-t, --email_template <text>',
    option_5: '-o, --status_options <text>',
    option_6: '-m, --headless_mode <bool>'
}

function registerCommand(program){
  program
    .command(cmdObj.name)
    .description(cmdObj.description)
    .action(cmdObj.func)
    .requiredOption(cmdObj.option_1)
    .requiredOption(cmdObj.option_2)
    .requiredOption(cmdObj.option_3)
    .requiredOption(cmdObj.option_4)
    .option(cmdObj.option_5)
    .option(cmdObj.option_6,'Headress Mode',false);
}


async function executeScraping(args){
    let scraper;
    try{
        await checkArgs(args);
        const precsData = await getPrecsData(args.shop_id);
        scraper = new AskSupportEmailScraper(precsData, args.order_date, args.product_code, args.status_options, args.email_template, args.headless_mode);
        await scraper.exec();
    }catch(e){
        await scraper.output('\n---------------------------------\n' + e + '\n---------------------------------\n');
    }finally{
        await scraper.output('>> scraper exit');
        await scraper.close();
    }

}

async function checkArgs(args){
    return args;

}

async function getPrecsData(id){
    const precsData = await Precs.findByPk(id);
    if(precsData === null) {
        throw new Error('Precs ID is not found');
    }
    return precsData;
}


module.exports = registerCommand;