'use strict';

const PrecsBaseScraper = require('./PrecsBaseScraper');
const { isBefore,format} = require('date-fns');


class AskSupportEmailScraper extends PrecsBaseScraper{

    constructor (shopData, date, product_code, status, template, headless_mode) {
        super(shopData, headless_mode);
        this.date = date;
        this.product_code = product_code;
        this.status = status;
        this.template = template;
    }

    /**
     * Main function
     */
    async exec(config){
        try{
            await this.login();
            await this.mainProcess(config);
        }catch(e){
            throw new Error(e.message);
        }

    }

    async checkDate(){
        if( this.date === undefined ){
            throw new Error('Date is not found.');
        }
        const reg = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
        if( !reg.test(this.date) ){
            throw new Error('Date format is incorrect.');
        }
        if( isBefore(new Date(this.date), new Date(format(new Date(), 'yyyy-MM-dd')))){
                throw new Error('Please date after today');
        }
    }


    async mainProcess(){

        try{

                await Promise.all([
                    this.page.evaluate( () => {
                        document.querySelector('.nav-sidebar > .nav-item:nth-child(5) > a').click();
                        document.querySelector('.nav-sidebar > .nav-item:nth-child(5) > .nav > .nav-item:nth-child(1) > a').click();
                    }),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);

                // 検索結果表示を300に変更
                await this.page.select('select[name="search_page_max"]','300');


                // 対応ステータス 「発送済み」を選択
                await this.page.select('select[name="search_order_status"]','5');

                // 商品コードを入力
                await this.page.type('input[name="search_product_code"]',this.product_code);
                
                // 発送日を絞り込む
                await this.page.type('input[name="search_scommit_date"]',this.date);
                await this.page.type('input[name="search_ecommit_date"]',this.date);

                // 定期購入回数 1回〜１回
                await this.page.type('input[name="search_s_regular_cron_times"]','1');
                await this.page.type('input[name="search_e_regular_cron_times"]','1');

                // 顧客ステータスを選択
                if(typeof this.status !== 'undefined'){

                    const select_arr = this.status.split(',');

                    this.page.evaluate( (select_arr ) => {
                        const statuses = document.querySelectorAll('input[name="search_customer_status[]"]');

                        statuses[0].parentElement.textContent
    
                        statuses.forEach( (status) => {
                            const text = status.parentElement.textContent;
                            const result = select_arr.includes(text);
                            if(result){
                                status.checked = true;
                            }
                        });
                    },select_arr );

                }


                await this.page.waitForTimeout(200);

                const order_status = await this.page.$('select[name="search_order_status"]');
                if(await ( await order_status.getProperty('value')).jsonValue() === '5'){
                    this.logger.info('>> Selected status: 発送済み');
                }

                // 検索ボタン押す
                await Promise.all([
                    this.page.evaluate( () => {
                        document.querySelector('#btn_kensaku').click();
                    }),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);

                // 検索結果の件数取得
                let searchResult =await this.page.evaluate( () => {
                    let text = document.querySelector('span.reselt').textContent.trim().replace('\n','').replace('件','');
                    let num = Number(text);
                    if(isNaN(num)){
                        throw new Error('Search result is invalid value: ' + text);
                    }
                    return num;
                });

                this.logger.info('>> Search result: ' + searchResult + '件');
                
                // 0件なら処理終了
                if(searchResult === 0){ return false;}

                // 表示結果全選択
                await this.page.evaluate( () => {
                    document.querySelector('#all_order_select_btn').click();
                });

                await this.page.waitForTimeout(1200);

                // 代理注文だけ除外
                await this.page.evaluate( () => {
                    const tds = document.querySelectorAll('.order_id_td');
                    tds.forEach( (td) => {
                        console.log(td.firstElementChild.alt === '通販受注');
                        if(td.firstElementChild.alt === '通販受注'){
                            td.parentElement.firstElementChild.firstElementChild.firstElementChild.checked = false;
                            console.log(td.parentElement.firstElementChild.firstElementChild.firstElementChild)
                        }
                    });
                });

                const orderCount = await this.page.evaluate( () => {
                    let orderCount = 0;
                    const tds = document.querySelectorAll('.order_id_td');
                    tds.forEach( (td) => {
                        if(td.firstElementChild.alt !== '通販受注'){
                            orderCount++;
                        }
                    });
                    return orderCount;
                });

                this.logger.info('>> Target orders: ' + orderCount + '件');

                await this.page.waitForTimeout(200);
                
                // メール画面へ遷移
                await Promise.all([
                    this.page.evaluate( () => {
                        document.querySelector('#order_tool_box > .od_tooltip > span').click();
                        document.querySelector('#send_mail_to_search').click();
                    }),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);
               

                // メールテンプレートを選択するselectのindex番号を検索
                let templateValue = await this.page.evaluate( (template) => {
                    let options = document.querySelector('select[name="template_id"]').options;
                    for(var n = 0, len = options.length; n < len; n++){
                        if(options[n].text === template){
                            return String(options[n].value);
                        }
                    }
                },this.template);

                if(typeof templateValue === 'undefined'){
                    throw new Error('Template is not found.\nTemplate name is missing.');
                }

                // メールテンプレートを選択
                await Promise.all([
                    this.page.select('select[name="template_id"]',templateValue),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);

                this.logger.info('>> Selected email template: ' + this.template);
                await this.page.waitForTimeout(400);

                // 確認ページへ遷移
                await Promise.all([
                    this.page.evaluate( () => {
                        document.querySelector('#btn_kakunin').click();
                    }),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);
                

                // 送信ボタンを押す
                await Promise.all([
                    this.page.evaluate( () => {
                        document.querySelector('#btn_sousin').click();
                    }),
                    this.page.waitForNavigation({waitUntil: 'load'})
                ]);

                return false;

        }catch(e){
            throw new Error(e.message);
        }
    
    }

}


module.exports = AskSupportEmailScraper;