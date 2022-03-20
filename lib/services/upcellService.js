'use strict';

const fs = require('fs');
const {google} = require('googleapis');

class SpreadsheetService{

    constructor(credentials_file_path,token_file_path){
        this.token_file_path = token_file_path;
        this.credentials_file_path = credentials_file_path;
        this.auth = '';
    }

    async authenticate(){
      const content = fs.readFileSync(this.credentials_file_path);
      const token = fs.readFileSync(this.token_file_path);
      const {client_secret, client_id, redirect_uris} = JSON.parse(content).web;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
      );
      oAuth2Client.setCredentials(JSON.parse(token));
      this.auth = oAuth2Client;
      return oAuth2Client;
    }


    async listMajors(){
      const sheets = google.sheets({version: 'v4', auth:this.auth });
      sheets.spreadsheets.values.get({
        spreadsheetId: '10zzmIcqpojFV5YXqL9me70HwYu1zQXeYv9avHHm5Ljc',
        range: 'B2:B10',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        console.log(res.data);
        const rows = res.data.values;
      });
    }

}

( async () => {
  const i = new SpreadsheetService('./credentials.json','./token.json');
  await i.authenticate();
  await i.listMajors();
})();
