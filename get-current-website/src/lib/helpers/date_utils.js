/**
 * @description
 * Return string in double-digit style. 
 * @example
 * dd(3) == '03'
 * dd(12) == '12'
 * */
function dd(num) {
    num = parseInt(num) //Just in case the input is string.
    if (num < 10) return '0' + num
    else return '' + num
}
/**
 * @description
 * Return string in 12 hour system. For example: `12:10 PM`
 * @param {Date} time 
 */
function hour_min_12(time) {
    return `${time.getHours() % 12 || 12}:${dd(time.getMinutes())}${time.getHours() < 12 ? 'AM' : 'PM'}`
}

function strMon(num, short) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (short)
        return monthNames[num].toUpperCase().substr(0, 3)
    else
        return monthNames[num]
}

/**
 * Return formatted date string as `YYYY-MM-DD` eg: `2021-06-01`
 * @param {Date} date - Date object
 */
export function getFormattedDateString(date) {
    let months = {
        '0': '01', '1': '02', '2': '03', '3': '04', '4': '05', '5': '06', '6': '07',
        '7': '08', '8': '09', '9': '10', '10': '11', '11': '12'
    }
    let day = dd(date.getDate())
    return `${date.getFullYear()}-${months[date.getMonth()]}-${day}`
}

/**
 * return time string as hh:mm
 * @param {Date} date - Date object
 */
export function getTimeString(date) {
    return `${dd(date.getHours())}:${dd(date.getMinutes())}`
}

/**
 * Return Date object from formatted string
 * @param {string} strDate : Formated string (returned by getFormattedDateString) in style `yyyy-mm-dd`
 * @param {boolean} ignoreTimezone : If set true, the returned Date will be `yyyy-mm-dd UTC+0` ignoring the client time zone.
 */
export function getDateFromString(strDate, inUTC) {
    let dateInTimeZone = new Date()
    if (inUTC) {
        try {
            dateInTimeZone.setUTCFullYear(strDate.split('-')[0])
            dateInTimeZone.setUTCMonth(strDate.split('-')[1] - 1)
            dateInTimeZone.setUTCDate(strDate.split('-')[2])
        }
        catch {
        }
        dateInTimeZone.setUTCHours(0)
        dateInTimeZone.setUTCMinutes(0)
        dateInTimeZone.setUTCSeconds(0)
        dateInTimeZone.setUTCMilliseconds(0)
    }
    else {
        try {
            dateInTimeZone.setFullYear(strDate.split('-')[0])
            dateInTimeZone.setMonth(strDate.split('-')[1] - 1)
            dateInTimeZone.setDate(strDate.split('-')[2])
        }
        catch {
        }
        dateInTimeZone.setHours(0)
        dateInTimeZone.setMinutes(0)
        dateInTimeZone.setSeconds(0)
        dateInTimeZone.setMilliseconds(0)
    }
    return dateInTimeZone
}

/**
 * Return Event dates period string descriptive.
 * @param {*} start - DateTime ISOString
 * @param {*} end - DateTime ISOString
 * @param {*} withTime - Boolean
 */
export function getEventDates(start, end, withTime) {
    if (!start) {
        start = new Date().toISOString()
    }
    if (!end) {
        end = new Date().toISOString()
    }

    let startDate = new Date(start)
    let endDate = new Date(end)

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (withTime) {
        // return `${startDate.getDate()} ${((startDate.getFullYear()!=endDate.getFullYear()) || (startDate.getMonth()!=endDate.getMonth())) ? strMon(startDate.getMonth())+' ':''}${(startDate.getFullYear()!=endDate.getFullYear())?' '+startDate.getFullYear():''} ${startDate.toTimeString().substr(0,5)} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.toTimeString().substr(0,5)} ${endDate.getFullYear()}`
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()} ${startDate.toTimeString().substr(0, 5)} ${startDate.getFullYear() != endDate.getFullYear() ? startDate.getFullYear() + ' ' : ''}- ${monthNames[endDate.getMonth()]} ${endDate.getDate()} ${endDate.toTimeString().substr(0, 5)} ${endDate.getFullYear()}`
    } else {
        //[UI/UX] @dev/amartis: Design(html) shows DATE-DATE MONTH. Sticking to design, in case time is not in display.
        if (startDate.getDate() === endDate.getDate() && startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
            return `${((startDate.getFullYear() != endDate.getFullYear()) || (startDate.getMonth() != endDate.getMonth())) ? strMon(startDate.getMonth()) + ' ' : ''}${(startDate.getFullYear() != endDate.getFullYear()) ? ' ' + startDate.getFullYear() : ''}${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`
        } else {
            return `${startDate.getDate()} ${((startDate.getFullYear() != endDate.getFullYear()) || (startDate.getMonth() != endDate.getMonth())) ? strMon(startDate.getMonth()) + ' ' : ''}${(startDate.getFullYear() != endDate.getFullYear()) ? ' ' + startDate.getFullYear() : ''} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`
        }
    }
}

/**
 * Return Event time slot period string descriptive.
 * @param {String} start - DateTime ISOString
 * @param {String} end - DateTime ISOString
 * @param {String} showEmpty - True: If start or end is not provided, it's assumed to be NOW.
 */
export function getEventTimes(start, end, showEmpty) {
    if (!start && !showEmpty) {
        start = new Date().toISOString()
    }
    if (!end && !showEmpty) {
        end = new Date().toISOString()
    }
    let startDate = start ? new Date(start) : null
    let endDate = end ? new Date(end) : null
    return `${startDate ? hour_min_12(startDate) : ''} - ${endDate ? hour_min_12(endDate) : ''}`
}

/**
 * Return short style date string. Eg: `1 Jun`
 * @param {Date} time 
 */
export function getShortStyleDate(time) {
    return `${time.getDate()} ${strMon(time, true)}`
}

/**
 * Returns time slot string
 * - when type~'timed entry'
 *      START-DATE[, START-YEAR if != this year], START-TIME - [END-DATE if diff, ][START-YEAR if != this year, ]END-TIME
 *      DATE style `Day MON`
 *      TIME style `hh:mmAM`
 * - when type~'general entry'
 *      Day Month[ ,Year if != this year]
 * - when type~'mutli-day entry'
 *      START-DATE[, START-YEAR if != this year] - END-DATE[, END-YEAR if != this year]
 *      DATE style `Day MON`
 * @param {String} start - DateTime ISOString
 * @param {String} end - DateTime ISOString
 * @param {String} type - Ticket type name
 */
export function getTimeSlotString(start, end, type) {
    if (type.toLowerCase().indexOf('time') >= 0)
        return getEventDates(start, end, true)
    else if (type.toLowerCase().indexOf('general') >= 0)
        return `${new Date(start).getDate()} ${strMon(new Date(start).getMonth())}, ${new Date(start).getFullYear()}`
    else if (type.toLowerCase().indexOf('multi') >= 0)
        return getEventDates(start, end, false)
}