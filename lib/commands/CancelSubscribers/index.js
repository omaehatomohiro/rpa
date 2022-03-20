'use strict';

const CancelSubscriptionScraper = require('../../scrapers/CancelSubscriptionScraper.js');
const PrecsModel = require('../../models/Precs');

const cmdObj = {
    name: 'cancelSubscription',
    description: '１回以上発送した対象商品IDの定期頒布会マスタをキャンセル処理する',
    func: (args) => executeScraping(args),
    option_1: '-s, --shop_id <number>',
    option_2: '-d, --update_date <date>',
    option_3: '-p, --product_ids <string>',
    option_4: '-m, --headless_mode <bool>'
}

function registerCommand(program){
  program
    .command(cmdObj.name)
    .description(cmdObj.description)
    .action(cmdObj.func)
    .requiredOption(cmdObj.option_1)
    .requiredOption(cmdObj.option_2)
    .requiredOption(cmdObj.option_3)
    .option(cmdObj.option_4,'Headress Mode',false);
}


async function executeScraping(args){
    let scraper;
    try{
        const shopData = await getPrecsData(args.shop_id);
        scraper = new CancelSubscriptionScraper(shopData, args.update_date, args.product_ids, args.headless_mode);
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