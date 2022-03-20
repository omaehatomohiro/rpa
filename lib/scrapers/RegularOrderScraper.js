'use strict';

const PrecsBaseScraper = require('./PrecsBaseScraper');
const { isBefore,format } = require('date-fns');

class RegularOrderScraper extends PrecsBaseScraper{

    constructor (shopData, date, headless_mode) {
        super(shopData, headless_mode);
        this.date = date;
        this.orderIdsArr = [];
    }

    /**
     * Main function
     */
    async exec(){
        try{
            await this.login();
            await this.mainProcess();
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
            // 日付のチェック            
            await this.checkDate();

            await Promise.all([
                this.page.evaluate( () => {
                    document.querySelector('.nav-sidebar > .nav-item:nth-child(5) > a').click();
                    document.querySelector('.nav-sidebar > .nav-item:nth-child(5) > .nav > .nav-item:nth-child(2) > a').click();
                }),
                this.page.waitForNavigation({waitUntil: 'load'})
            ]);

            await this.page.waitForTimeout(1000);

            // 次回お届け日
            await this.page.type('input[name="search_end_next_date"]',this.date);

            // 自動受注発生件数 1回以上
            await this.page.type('input[name="search_count1"]','1');

            // check
            await this.page.evaluate(() => {
                document.querySelector('input[name="search_disp_stop"]').checked = true;
            });

            await this.page.waitForTimeout(1000);

            const inputCheckedText = await this.page.evaluate( (date) => {
                var text = '';
                if( !(document.querySelector('input[name="search_end_next_date"]').value === date) ){
                    text += '\nArrive date is not entered';
                }
                if( !(document.querySelector('input[name="search_count1"]').value === '1') ){
                    text += '\nCanceled is not checked';
                }
                if(!document.querySelector('input[name="search_disp_stop"]').checked){
                    text += '\nCanceled is not entered';
                }
                return text;
            },this.date);

            if( !(inputCheckedText === '' ) || (inputCheckedText === undefined ) ) {
                throw new Error('Input check error\n' + inputCheckedText);
            }

            this.output('>> Input check OK');

            await this.page.waitForTimeout(400);

            this.output('>> Process start');
            this.iterateFlag = true;

            while(this.iterateFlag) {
                this.iterateFlag = await this.searchOrder();
            }
        }catch(e){
            throw new Error(e.message);
        }
    
    }



    async searchOrder(){

        await Promise.all([
            this.page.evaluate( () => {
                document.querySelector('input#btn_kensaku').click();
            }),
            this.page.waitForNavigation({waitUntil: 'load'})
        ]);

        await this.page.waitForTimeout(1000);

        const orderCount = await this.page.evaluate( () => {
            var orderCount = Number( document.querySelector('.reselt').textContent.replace('件',''));
            return orderCount;
        });
        this.output('>>Search result: ' + orderCount);

        if( isNaN(orderCount) || orderCount === 0 ) {
            return false;
        }

        let orders = await this.page.evaluate( () => {
            let ids = [];
            let tds = document.querySelectorAll('#form1 .style1 tr td:nth-child(3)')
            tds.forEach( td => {
                ids.push(td.id.replace('order_id_td_',''));
            });
            return ids;
        });

        this.orderIdsArr.push(orders);

        // 実行のタブ開く
        await this.page.evaluate( () => {
          document.querySelector('#odnav_bt > .od_check label').click();
          document.querySelector('#order_tool_box .tool_box_trigger').click();
        });

        // 実行する
        this.output('>> click exec button');
        await this.page.evaluate( () => {
            document.querySelector('.od_submenu > li:last-child > a').click();
        });

        // 読み込みまつ
        await this.page.waitForNavigation({
          waitUntil: 'load'
        });
        await this.page.waitForTimeout(600);
    
        // 再読み込み時のmodalを消す
        await this.page.evaluate( () => {
          document.querySelector('input[value="OK"]').click();
        });

        return true;
    }

}




module.exports = RegularOrderScraper;