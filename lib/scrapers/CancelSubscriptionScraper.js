'use strict';

const PrecsBaseScraper = require('./PrecsBaseScraper');

class CancelSubscriptionScraper extends PrecsBaseScraper{

    constructor (precsData, updateDate, productIds, headless_mode) {
        super(precsData, headless_mode);
        this.updateDate = updateDate;
        this.productIds = productIds;
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


    /**
     * 
     */
    async mainProcess(){
        try{
            
            const textareaSelector = 'textarea[name="search_product_id_list"]';
            const updateDateSelector = 'input[name="search_supdate"]';
            const inputOrderCountSelector = 'input[name="search_count1"]';
            const inputOrderOptionSelector = 'input[name="search_disp_stop"]';

            this.output('>> cancel ids: ' + this.updateDate, this.productIds);
            
            // 定期/頒布会マスタ管理へ遷移
            await Promise.all([
                this.page.waitForNavigation({waitUntil: 'load'}),
                this.page.goto(this.domain + '/admin/order/regular.php')
            ]);

            // 検索のための商品IDを入れる
            await this.page.type(textareaSelector, this.productIds);
            // 更新日の入力
            await this.page.type(updateDateSelector, this.updateDate);
            // 自動受注発生件数 1回以上
            await this.page.type(inputOrderCountSelector,'1');
            // 解約済み受注を表示しないをcheck
            await this.page.$eval(inputOrderOptionSelector, elem => {
                elem.checked = true;
            })

            var val1 = await this.page.$eval(textareaSelector,elem => {
                return elem.value;
            });

            var val2 = await this.page.$eval(updateDateSelector,elem => {
                return elem.value;
            });

            var val3 = await this.page.$eval(inputOrderCountSelector,elem => {
                return elem.value;
            });

            var val4 = await this.page.$eval(inputOrderOptionSelector,elem => {
                return elem.checked;
            });

            if( !(val1 === this.productIds) ){
                throw new Error('>> 「商品ID」が入力されていません。');
            }

            if( !(val2 === this.updateDate) ){
                throw new Error('>> 「更新日」が入力されていません。');
            }

            if( !(val3 === '1') ){
                throw new Error('>> 「自動受注発生件数 1回以上」が入力されていません。');
            }

            if( !val4  ){
                throw new Error('>> 「解約済み受注を表示しない」がcheckされていません。');
            }

            // 検索ボタン押す
            await Promise.all([
                this.page.evaluate( () => {
                    document.querySelector('input#btn_kensaku').click();
                }),
                this.page.waitForNavigation({waitUntil: 'load'})
            ]);

            // 検索結果の件数を取得
            const orderCount = await this.page.evaluate( () => {
                var orderCount = Number( document.querySelector('.reselt').textContent.replace('件',''));
                return orderCount;
            });
            this.output('>> Search result: ' + orderCount);
    
            // 検索結果が0件だったら終了
            if( isNaN(orderCount) || orderCount === 0 ) {
                return false; // searchOrder 終了
            }

            // 解約する定期のDOM IDを配列で取得
            const targetIds = await this.page.evaluate( () => {
                const ids = [];
                const tds = document.querySelectorAll('#form1 .style1 tbody > tr:not(.bg_canceled_regular)');
                for(var i = 3, len = tds.length; i < len; i+=3 ){
                    console.log(tds[i]);
                    ids.push(tds[i].children[11].children[0].id);
                }
                return ids;
            });

            // 解約処理
            for(var i = 0, len = targetIds.length; i < len; i++ ){
                // 解約可能なステータスか確認
                let isActive = await this.isOrderActive(targetIds[i]);
                if(isActive){
                    // order id を取り出す
                    let orderId = await this.extractOrderID(targetIds[i]);
                    // 解約ダイアログを開く
                    await this.openDialog(targetIds[i]);
                    // 解約理由を選択
                    await this.selectCancelReason();
                    // 確定するためOKボタンを押す
                    await this.clickCancelButton();
                    await this.page.waitForTimeout(1200);
                    // 削除しましたダイアログの「OK」をクリック（ダイアログが閉じる）
                    await this.cancelAfterAction();
                    // キャンセル完了のログ出力
                    this.output('>> Cancel success orderID: ' + orderId);
                    await this.page.waitForTimeout(200);
                }
            }
           
        }catch(e){
            throw new Error(e.message);
        }
    }

    async isOrderActive(targetId){
        return await this.page.evaluate( (targetId) => {
            var text = document.querySelector('#' + targetId + ' a span').textContent;
            return text === '解約';
        },targetId);
    }


    async openDialog(targetId){
        await this.page.evaluate( (targetId) => {
            document.querySelector('#' + targetId + ' a').click();
        },targetId);
        await this.page.waitForTimeout(100);
    }


    async selectCancelReason(){
        await this.page.evaluate( () => {
            let selector = document.getElementById('selected_canceled_reason_id');
            selector.click();
            let optionLen = selector.options.length;
            for(var n = 0; n < optionLen; n++){
                if(selector.value === 14){
                    selector.options[n].selected = true;
                }
            }
        });
    }


    async clickCancelButton(){
        await this.page.evaluate( () => {
            let selector = '.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons.ui-draggable.ui-resizable > .ui-dialog-buttonpane > .ui-dialog-buttonset > button';
            let text = document.querySelector(selector).textContent;
            if(text === 'OK'){
                document.querySelector(selector).click();
            }
        });
    }

    async cancelAfterAction(){
        await this.page.evaluate( () => {
            let selector = 'input[type="button"]';
            let text = document.querySelector(selector).value;
            if(text === 'OK'){
                document.querySelector(selector).click();
            }
        });
    }

    async extractOrderID(className){
        return className.replace('in_operation_block_','');
    }

}



module.exports = CancelSubscriptionScraper;