/**
 * Capitalize the leading character
 * @example
 * capitalizeLeading('apple') == 'Apple'
 * @param {String} word 
 */
function capitalizeLeading(word) {
    if (word) {
        return word[0].toUpperCase() + word.substr(1)
    }
    else
        return word
}

function getFullName(firstName, lastName, middleName) {
    return `${firstName ? firstName + ' ' : ''}${middleName ? middleName + ' ' : ''}${lastName ? lastName : ''}`
}

/**
 * Place comma after every three digits.
 * @param {int|String} num 
 * @example
 * styleNumber(7847258998) == '7,847,258,998'
 */
function styleNumber(num) {
    let strNum = '' + num
    //[UI/UX] @dev/amartis: Show N/A when the input is not valid number.
    if (strNum != num) strNum = 'N/A'
    return strNum.replace(/\B(?=(\d{3})*$)/g, ",");
}

export { capitalizeLeading, getFullName, styleNumber }