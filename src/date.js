class Dates {
    getDayOfTheYear(now) {
        if (!(now instanceof Date)) throw "Invalid date type";
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let day = 1000 * 60 * 60 * 24;

        return Math.floor(diff / day);
    } 


    getDatesInbetween(start, end) {
        if (!(start instanceof Date)) throw "Invalid date type";
        if (!(end instanceof Date)) throw "Invalid date type";
        
        let startDays   = this.getDayOfTheYear(start);
        let endDays     = this.getDayOfTheYear(end);

        let year    = start.getFullYear();

        let diff    = endDays - startDays;
        let dates   = new Array(diff + 1);
        
        for (let i = 0; i <= diff; i++) {
            let date = new Date(Date.UTC(2017, 0, 1));
            let currentDay = i - 1; // Fix off by one error

            date.setDate(date.getDate() + startDays + currentDay);
            dates[i] = date;
        }

        return dates;
    }
}

module.exports = new Dates();
