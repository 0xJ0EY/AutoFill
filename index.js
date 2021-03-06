const puppeteer = require('puppeteer');
const formatUni = require('format-unicorn');
const sleep     = require('system-sleep');

const dates     = require('./src/date');
const week      = require('./src/week');
const selectors = require('./src/selectors');

const config    = require('./config.json');
const data      = require('./data.json');

const fs        = require('fs');

const days = dates.getDatesInbetween(
    new Date(data.dateStart), 
    new Date(data.dateEnd)
);

(async() => {
    const browser   = await puppeteer.launch(config.browserSettings);
    const page      = await browser.newPage();

    page.on('dialog', dialog => {
        sleep(1000);
        dialog.accept();
    });

    await page.setUserAgent(config.page.userAgent);    
    await page.setViewport(config.page.viewport);

    await page.goto(config.pageUrl, {waitUntil: 'domcontentloaded'});

    for (let i = 0; i < days.length; i++) {
        let curWeek = Math.ceil(i / 7);

        // Get right date from date object 
        let date    = days[i];
        let day     = date.getDate();
        let month   = date.getMonth() + 1;
        let year    = date.getFullYear();

        let shows   = data.shows[week[date.getDay()]];

        for (let j = 0; j < shows.length; j++) {
            let show = shows[j]; 

            // Student nummer
            await page.click(selectors.STUDENT_NR);
            await page.keyboard.type(data.studentNr);

            // Rating
            let rating = show.rating[curWeek % show.rating.length];

            await page.click(selectors.RATING_CONTAINER + ' div[data-value="'+ rating +'" i]', {delay: 100});

            // Date
            await page.evaluate((sTotal, sDay, sMonth, sYear, day, month, year) => {
                var total = year + '-' + month + '-' + day;
                var input = document.querySelector(sTotal);
                input.setAttribute('value', total);
                input.setAttribute('data-initial-value', total);
                input.setAttribute('badinput', false);
                input.setAttribute('ltr', false);

                // Set hidden sub items
                var input = document.querySelector(sDay);
                input.setAttribute('value', day);

                var input = document.querySelector(sMonth);
                input.setAttribute('value', month);

                var input = document.querySelector(sYear);
                input.setAttribute('value', year);

                }, 
                selectors.DATE, 
                selectors.DATE_DAY,
                selectors.DATE_MONTH,
                selectors.DATE_YEAR, 
                day,
                month,
                year
            );
            

            // Time started (HH:MM)
            let timeStarted = show.started[curWeek % show.started.length];
            let started = timeStarted.split(":", 2);

            await page.click(selectors.STARTED_HOURS);
            await page.keyboard.type(started[0]);

            await page.click(selectors.STARTED_MINUTES);
            await page.keyboard.type(started[1]);
        
            // Multi select devices
            for (let k = 0; k < show.devices.length; k++) {
                let value = show.devices[k];

                await page.click(selectors.DEVICE_CONTAINER + ' div[data-value="'+ value +'" i] span');
            }

            // Multi select device other
            if (show.deviceOther.length > 0) {
                await page.click(selectors.DEVICE_OTHER);
                await page.keyboard.type(show.deviceOther);
            }

            // Programma dropdown
            await page.click(selectors.CHANNEL);
            let program = show.channel;
            await page.click(selectors.CHANNEL_CONTAINER + ' div[data-value="'+ program +'" i]')

            // Program
            await page.click(selectors.PROGRAM);

            let name = show.name.formatUnicorn({
                "week": 1 + curWeek
            });

            await page.keyboard.type(name);
            
            // Time watched (HH:MM)
            let timeWatched = show.watched[curWeek % show.watched.length];
            let watched = timeWatched.split(":", 2);

            await page.click(selectors.WATCHED_HOURS);
            await page.keyboard.type(watched[0]);

            await page.click(selectors.WATCHED_MINUTES);
            await page.keyboard.type(watched[1]);

            await page.click(selectors.SUBMIT_BUTTON);
            sleep(100); // waitForNavigation doesnt seem to work, so just wait a forced amount.

            writeLog(date.toDateString() + " " + name);

            let waitSec = (60 + (Math.random() * 120)) * 100;
            console.log('Wait: ' + waitSec);
            sleep(waitSec);

            await page.click(selectors.CONTINUE_BUTTON);
            sleep(100);
        }
    }
})();

function writeLog(log) {
    if (!fs.existsSync('./log.txt')) {
        fs.writeFile("./log.txt", "", (error) => {
            console.log(error);
        });
    }

    let date = new Date();
    let datePrefix = "[" + date.toDateString() + " " + date.toTimeString() + "] ";

    log = datePrefix + log + "\r\n";

    fs.appendFileSync("./log.txt", log);
}