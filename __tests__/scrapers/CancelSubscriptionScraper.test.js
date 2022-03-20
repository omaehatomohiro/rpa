const Scraper = require('../../lib/scrapers/CancelSubscriptionScraper');

test('CancelSubscriptionScraper read successful', () => {
    expect(typeof Scraper).toMatch('function')
});


// test('CancelSubscriptionScraper read successful', () => {
//     const shopData = {

//     }
//     const args = {
//         update_date: 0,
//         product_ids: 0,
//         headless_mode: 1,
//     }
//     const scraper = new Scraper(shopData, args.update_date, args.product_ids, args.headless_mode);
//     expect(typeof Scraper).toMatch('function')
// });