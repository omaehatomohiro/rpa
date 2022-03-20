'use strict';

const puppeteer = require('puppeteer');
const logger = require('../helpers/logger');

class PrecsBaseScraper{

    constructor (precsData, headless_mode) {
        this.shop_id   = precsData.id;
        this.brand     = precsData.name;
        this.headless_mode = headless_mode;
        this.domain    = 'https://' + precsData.domain;
        this.basic_user = precsData.basic_user;
        this.basic_pass = precsData.basic_pass;
        this.precs_user = precsData.precs_user;
        this.precs_pass = precsData.precs_pass;
        this.logger     = logger;
    }


    async exec(){
        throw new Error('exec function is not defined');
    }

    async close(){
        await this.browser.close();
    }

    async output(msg){
        this.logger.info(msg);
    }

    async login(){
        try{
            await this.init();
            await this.basicAuth();
            await this.page.goto( this.domain + '/admin' );
            await this.precsSignin();
            await this.output('>> Precs login success');
        }catch(e){
            throw new Error(e.message);
        }
    }


    async init(){
        try{
            let puppeteerArgs;
            if(this.headless_mode){
                this.logger.info('>> Exec headless mode');
                puppeteerArgs = {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                    ],
                }
            }else{
                puppeteerArgs = {
                    headless: false,
                    slowMo: 250,
                    args: ['--no-sandbox'],
                }
            }
            this.browser = await puppeteer.launch(puppeteerArgs);
            this.page = await this.browser.newPage();
            await this.page.setDefaultNavigationTimeout(0);
            await this.page.setViewport({ width: 1320, height: 960 });
        }catch(e){
            throw new Error('Initialize failed.\n' + e.message);
        }
    }

    async basicAuth(){
        try{
            await this.page.authenticate({
                username: this.basic_user,
                password: this.basic_pass
            });
        }catch(e){
            throw new Error('Precs basic auth failed.\n' + e.message);
        }
    }

    async precsSignin(){
        try{
            await this.page.type('input[name="login_id"]', this.precs_user);
            await this.page.type('input[name="password"]', this.precs_pass);
            await Promise.all([
                this.page.click('input[name="subm"]'),
                this.page.waitForNavigation({ waitUntil: 'load'}),
            ]);
            await this.page.evaluate(() => {
                var modals = document.querySelectorAll('div.remodal-wrapper');
                if(modals.length === 0) return false;
                for(var i = 0, len = modals.length; i < len; i++){
                  modals[i].click();
                }
            });
            await this.page.on('dialog', async dialog => {
                await dialog.accept();
            });
        }catch(e){
            throw new Error('Precs signin failed.\n' + e.message);
        }
    }

    async screenshot(){
        await this.page.screenshot({
            path: process.env.BASE_DIR + '/screenshots/' + Date.now() + '.png',
        });
    }

    async wait(msec){
        return new Promise( resolve => {
            setTimeout( () => {
                resolve();
            },msec);
        });
    }

    async windowScrollY(pixel){
        await this.page.evaluate( (pixel) => {
            scrollBy(0, pixel);
        },pixel);
    }

}


module.exports = PrecsBaseScraper;