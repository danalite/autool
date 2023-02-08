 export const parseCron = (cron, num = 25) => {

    let interval = require("cron-parser").parseExpression(cron);

    var count = 0;
    var nextDates = [];
    var hasNext = true;
    while (hasNext && count < num) {
      try {
        var obj = interval.next();
        nextDates.push({ stamp: obj.getTime() });
        count++;
      } catch (e) {
        hasNext = false;
        break;
      }
    }
    return nextDates;
 }