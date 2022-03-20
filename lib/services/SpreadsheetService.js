'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
// const sheets = google.sheets('v4');


class SpreadsheetService{

    constructor(){
    
    }

    async authenticate(){
        const SCOPES = ['https://www.googleapis.com/auth/drive'];
        const content = fs.readFileSync(path.resolve(__dirname,'../config/credentials.json'));
        const tokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../config/tokens.json')));
        const {client_secret, client_id, redirect_uris} = JSON.parse(content).web;
        const oauth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]
        );

        oauth2Client.setCredentials(tokens);

        // expired token
        oauth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                // store the refresh_token in my database!
                console.log(tokens);
            }
            // tokenがまだ有効な時
            // console.log('token eventの外');
        });

        // this.auth = oauth2Client;
        this.sheets = google.sheets({version: 'v4', auth: oauth2Client});
    }
    

    async getText(spreadsheetId,sheet_name,range){

        var params = {
            spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.
            range: sheet_name + '!' + range,  // TODO: Update placeholder value.
            //majorDimension: "COLUMNS",
            //majorDimension: "ROWS",
        };
      
        try {
            const response = (await this.sheets.spreadsheets.values.get(params)).data;
            console.log(response.values);
        } catch (err) {
            console.error(err);
        }
    }


    async processDone(spreadsheetId){

        const values = [
            ["A1", "B1"],
            ["2019/1/1", "2020/12/31"],
            ["アイウエオ", "かきくけこ"],
            [10, 20],
            [100, 200],
        ];
          const resource = {
            values,
          };
        this.sheets.spreadsheets.values.update({
            spreadsheetId:spreadsheetId,
            range:'シート1!A2:B7',
            valueInputOption:'USER_ENTERED',
            resource,
          }, (err, result) => {
            if (err) {
              // Handle error
              console.log(err);
            } else {
              console.log('%d cells updated.', result.updatedCells);
            }
        });
    }



    async exec(){
        await this.authenticate();
        await this.processDone('1f-LVuQQInn7HR5p5j_es8vcvPRLwFkwckSwsTGwEwhA');

        // マカおまとめ定期便
        // var sheet_1 = '1Tx_W6ZCXSAfVWZv_1DonTMXvWFd8H8BY6_za5oeL7GA';
        // // マカ休眠おまとめ定期便
        // var sheet_2 = '1Tx_W6ZCXSAfVWZv_1DonTMXvWFd8H8BY6_za5oeL7GA';
        // const sheet_name = 'マカ休眠おまとめ定期便'
        // const range = 'A:D';
        // await this.getText(sheet_2,sheet_name,range);
        //await this.getE('1f-LVuQQInn7HR5p5j_es8vcvPRLwFkwckSwsTGwEwhA');
    }



}


(async () => {
    const obj = new SpreadsheetService();
    await obj.exec();
})();