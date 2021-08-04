/**
 * 
 * @param {*} cent 
 */
export function fixedFloatString(cent) {
    return (cent/100).toFixed(2)
}

export function price_number(cents) {
    const str = (cents/100).toFixed(2)
    const intPart = str.substr(0, str.indexOf("."))
    const decPart = str.substr(str.indexOf("."))
    return intPart.replace(/\B(?=(\d{3})*$)/g, ",") + decPart
}

export function geoDistance(lat1, lon1, lat2, lon2, id) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d
}