'use strict';

const UpcellScraper = require('../../scrapers/UpcellScraper.js');
const Precs = require('../../models/Precs');


const cmdObj = {
    name: 'upcell',
    description: 'description text',
    func: (args) => executeScraping(args),
    option_1: '-s, --shop_id <number>',
    option_2: '-o, --order_id <number>',
    option_3: '-c, --current_product <number>',
    option_4: '-u, --upcell_product <number>',
    option_5: '-m, --headless_mode <bool>'
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
    .option(cmdObj.option_5,'Headress Mode',false);
}


async function executeScraping(args){
    let scraper;
    try{
        await checkArgs(args);
        const precsData = await getPrecsData(args.shop_id);
        scraper = new UpcellScraper(precsData, args.headless_mode);
        await scraper.exec(args.order_id, args.current_product, args.upcell_product);
    }catch(e){
        await scraper.output('\n-------------------------------\n' + e + '\n-------------------------------\n');
    }finally{
        await scraper.output('>> scraper exit');
        await scraper.close();
    }
}

async function checkArgs(args){

    // shop
    if( isNaN(Number(args.shop_id)) ){
        throw new Error('-s shop_id must be integer');
    }

    if(typeof args.order_id === 'undefined'){
        if( isNaN(args.order_id) ){
            throw new Error('-i order id must be integer');
        }
        throw new Error('-o order_id is not found');
    }

    if(typeof args.current_product === 'undefined'){
        if( isNaN(args.current_product) ){
            throw new Error('-i current product id must be integer');
        }
        throw new Error('-c current_product is not found');
    }

    if(typeof args.upcell_product === 'undefined'){
        if( isNaN(args.upcell_product) ){
            throw new Error('-i upcell product id must be integer');
        }
        throw new Error('-u upcell_product is not found');
    }

    return true;

}


async function getPrecsData(id){
    const precsData = await Precs.findByPk(id);
    if(precsData === null) {
        throw new Error('Precs ID is not found');
    }
    return precsData;
}


module.exports = registerCommand;