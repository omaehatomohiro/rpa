'use strict';

const PrecsBaseScraper = require('./PrecsBaseScraper');

class UpcellScraper extends PrecsBaseScraper{

    constructor (precsData, headless_mode) {
        super(precsData, headless_mode);
    }

    /**
     * Main function
     */
    async exec(order_id, current_product, upcell_product){
        try{
            await this.login();
            await this.mainProcess(order_id, current_product, upcell_product);
        }catch(e){
            throw new Error(e.message);
        }
    }


    /**
     * 
     */
    async mainProcess(order_id, current_product, upcell_product){
        try{
            this.output('>> exec: order_id ' + order_id + ', current_product '+ current_product + ', upcell_product '+ upcell_product);
            await this.page.goto(this.domain + '/admin/inform/index.php');
            
            // 注文IDから定期受注情報を検索ボタン押すまで
            const noData = await this.searchMasterFromOrderID(order_id);
            // 定期IDがない場合
            if(noData){
                process.exitCode = 2;
                throw new Error('こちらの定期ID [' + order_id + '] は見つかりませんでした');
            }
            // 継続中の定期か確認
            await this.statusCheck();

            await this.changeOrderProduct(current_product, upcell_product);

            await this.copyCustomerText();
            await this.page.waitForResponse('https://belta-shop.jp/admin/inform/ajax.php');
            
            // 注文登録 を押す
            await this.page.evaluate(() => {
                document.querySelector('#order_reg_btn').click();
            });

            await this.page.waitForTimeout(400);
            await this.page.evaluate(() => {
                document.querySelector('#order_complete_btn').click();
            });

            await this.page.waitForTimeout(2000);
        }catch(e){
            throw new Error(e.message);
        }
    }



    /**
     * 
     * @param {string} order_id 
     */
    async searchMasterFromOrderID(order_id){
        try{
            await  this.page.waitForSelector('#regularWidget > .portlet-header #search_regular_open_btn');
            await  this.page.evaluate(() => {
                document.querySelector('#regularWidget > .portlet-header #search_regular_open_btn').click();
            });
            // 定期IDを入力
            await  this.page.evaluate((id) => {
                document.querySelector('input[name="search_regular_id"]').value = id;
            },order_id);

            // 正しい定期IDが入っているかcheck
            let regularOrderNumberCheck = await  this.page.evaluate((id) => {
                return document.querySelector('input[name="search_regular_id"]').value === id;
            },order_id);

            this.output('>> regularOrderNumberCheck: ' + regularOrderNumberCheck);

            if(!regularOrderNumberCheck) {
                // 再度 定期IDを入力
                await  this.page.evaluate((id) => {
                    document.querySelector('input[name="search_regular_id"]').value = id;
                },order_id);
    
                // 再度 正しい定期IDが入っているかcheck
                regularOrderNumberCheck = await  this.page.evaluate((id) => {
                    return document.querySelector('input[name="search_regular_id"]').value === id;
                },order_id);

                if(regularOrderNumberCheck){
                    throw new Error('受注IDの入力ができません');
                }
            }

            // 検索
            await this.page.evaluate(() => {
                document.querySelector('#search_regular_btn').click();
            });

            await this.page.waitForResponse('https://belta-shop.jp/admin/inform/ajax.php');
            await this.page.waitForTimeout(1000);

            // 検索結果があるかないか？
            return await this.page.evaluate(() => {
                return document.querySelector('#regular_no_data').style.display !== 'none'
            });
        }catch(e){
            throw new Error(e.message);
        }

    }




    /**
     * Change project ID 
     * @param {string} upcell_product
     */
    async changeOrderProduct(current_product,upcell_product){
        try{
            this.output('>> changeOrderProduct start');

            await this.page.evaluate(() => {
                var dom = document.querySelector('#regular_orders_list > *');
                if(dom === null) {
                    throw new Error('該当受注なし');
                }
            });

            await this.page.waitForTimeout(400);

            // マスターを開く
            await this.page.evaluate(() => {
                document.querySelector('#regular_orders_list > div').click();
            });

            await this.page.waitForTimeout(400);

            // マスター編集ボタンを押す
            await this.page.evaluate(() => {
                document.querySelector('#regular_orders_list > div:last-child > div:last-child > button').click()
            });

            await this.page.waitForTimeout(400);
            

            const delete_current_num = await this.page.evaluate(() => {
                return document.querySelector('#order_detail_list > tr > .ctr1').textContent;
            });

            const productMatched = await this.currentProductCheck(delete_current_num,current_product);

            if(!productMatched){
                var str = '変更前の商品ID（' + delete_current_num +'）が\n変更元商品ID（' + current_product + '）に一致しません';
                process.exitCode = 4;
                throw new Error(str);
            }

            // 注文商品解除 ゴミ箱icon
            await this.page.evaluate(() => {
                document.querySelector('#order_detail_list tr > td button').click();
            });

            this.output('>> Current product delete. ID: ' + delete_current_num);
            
            await this.page.waitForTimeout(1200);


            await this.page.evaluate((upcell_product) => {
                // 注文入力 > 商品検索タブ選択
                document.querySelector('#entry_tab_ul #htabsm-2').click();
                // 商品ID入力
                document.querySelector('input[name="search_product_id"]').value = upcell_product;
            },upcell_product);

            await this.page.waitForTimeout(300);

            // 商品ID入力のcheck
            const upcellProductIDEntered = await this.page.evaluate((upcell_product) => {
                return document.querySelector('input[name="search_product_id"]').value === upcell_product;
            },upcell_product);

            // 商品ID入ってなかったら
            if(!upcellProductIDEntered){
                this.output('>> upcellProductID is not entered');
                // 再度 注文ID入力
                await this.page.evaluate((upcell_product) => {
                    document.querySelector('input[name="search_product_id"]').value = upcell_product;
                },upcell_product);
            }

            await this.page.evaluate(() => {
                // 検索ボタン
                document.querySelector('#search_products  #search_product_btn').click();
            });


            // 検索結果まち
            await this.page.waitForSelector('#products_list input[name="select_product"]');

            //アップセル商品追加
            await this.page.evaluate(() => {
                document.querySelector('#products_list input[name="select_product"]').click();
            });
        }catch(e){
            throw new Error(e.message);
        }
    }

    async currentProductCheck(delete_current_num,current_product){
        const current_ids = current_product.replace(' ','').split(',');
        const del_num = Number(delete_current_num);
        return current_ids.some(num => {
            return del_num === Number(num);
        });
    }

    /**
     * Copy costomer text
     */
    async copyCustomerText(){
        try{
            this.output('>> copyCustomerText start');
            // 注文入力 > 顧客情報タブ選択
            await this.page.evaluate(() => {
                document.querySelector('#entry_tab_ul #htabsm-3').click();
            });

            await this.page.waitForTimeout(800);

            const customerText = await this.page.evaluate(() => {
                // 顧客問い合わせのテキスト取得
                return document.querySelector('#regular_orders_list > *:nth-child(2) tr:nth-child(9) > td span').textContent.trim();
            });

            if(customerText !== '') {
                this.output('>> customerText: ' + customerText);
                await this.page.evaluate((customerText) => {
                    // 顧客メモに入れる
                    document.querySelector('#edit_customer_note').value = customerText;
                },customerText);
            }else{
                this.output('>> customerText: empty');
            }
                
            // 注文入力 > 顧客情報タブ選択
            await this.page.evaluate(() => {
                document.querySelector('#entry_tab_ul #htabsm-5').click();
            });

            await this.page.evaluate(() => {
                // 注文時のサイクルを変更するに check
                document.querySelector('#change_order_cycle').click();
                // 間隔で指定 をcheck
                document.querySelector('#cycle_type3').click();
            });

            // 編集ボタン
            await this.page.evaluate(() => {
                document.querySelector('#edit_customer_btn').click();
            });
        }catch(e){
            throw new Error(e.message);
        }
    }
    
    /**
     * Status check
     * @returns 
     */
    async statusCheck(){
        try{        
            let status = await this.page.evaluate(() => {
                return document.querySelector('#regular_orders_list .list_status').textContent;
            });
        
            if ( status !== '継続中'){
                process.exitCode = 3;
                throw new Error('継続中以外のステータスです。\n現在のステータス: ' + status);
            }
            this.output('>> 定期ステータス: ' + status);  // 定期ステータス: 解約済
            return false;
        }catch(e){
            throw new Error(e.message);
        }
    }

}




module.exports = UpcellScraper;