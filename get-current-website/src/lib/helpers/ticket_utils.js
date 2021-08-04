function getTicketsData(tickets) {
    let price = null
    let qty = 0
    if (!tickets || tickets.length < 1) {
        return { price: 0, quantity: 0 }
    }
    let priceCount = 0;
    /*
    for (let item of tickets) {
        if (item.quantity >= 0)
            qty += item.quantity
        if (item.price !== price) {
            priceCount++
            */
    for (let item of tickets) {
        if (item.quantity < 0)
            qty = -1
        else if (qty >= 0)
            qty += item.quantity

        if (price === null) {
            price = item.price
            priceCount += 1
        }
        if (item.price !== price) {
            priceCount += 1
        }
        if (item.price < price) {
            price = item.price
        }
    }

    if (priceCount > 1)
        return { price: (price / 100).toFixed(2), quantity: qty, startingPrice: true }
    return { price: (price / 100).toFixed(2), quantity: qty, startingPrice: false }
}

export { getTicketsData }