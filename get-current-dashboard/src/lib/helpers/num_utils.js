export function price_number(cents) {
    const str = (cents/100).toFixed(2)
    const intPart = str.substr(0, str.indexOf("."))
    const decPart = str.substr(str.indexOf("."))
    return intPart.replace(/\B(?=(\d{3})*$)/g, ",") + decPart
}