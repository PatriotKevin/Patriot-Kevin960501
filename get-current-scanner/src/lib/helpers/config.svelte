<script context="module">
    export let config = {
        pageSize: 6,
    };
    config.getServerURL = function (url) {
        if (!url) return '';
        if (url[0] == "/") return `${config.serverURL}${url}`;
        else if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;
        else return `${config.serverURL}/${url}`;
    };
    function toFixed( num, precision ) {
        return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    }
    config.getWebsiteURL = function (url) {
        if (url[0] == "/") return `${config.websiteURL}${url}`;
        else if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;
        else return `${config.websiteURL}/${url}`;
    };
    config.getStripeFee = function (total, transactionsCount) {
        total = Number.parseInt(total)
        return toFixed(total*config.stripeFeePercent/100 + config.stripeFeePerSale*transactionsCount, 0)
    }
    config.getFee = function(total, transactionsCount) {
        total = Number.parseInt(total)
        const stripeFee = config.getStripeFee(total, transactionsCount)
        const afterStripeFee = total - stripeFee
        const appFee = toFixed(afterStripeFee*config.appFeePercent/100 + config.appFeePerSale*transactionsCount, 0)
        return Number.parseInt(stripeFee) + Number.parseInt(appFee) // Because stripeFee and appFee are of String type.
    }
    config.descEventLocation = function(location) {
        let infos = []
        if (location.street) {
            infos.push(location.street)
        }
        if (location.city) {
            infos.push(location.city)
        }
        return infos.join(', ')
    }
    
    config.serverURL = import.meta.env["VITE_API_SERVER_URL"]
    config.dashboardURL = import.meta.env["VITE_DASHBOARD_URL"]
    config.websiteURL = import.meta.env["VITE_WEBSITE_URL"]
    config.stripeClientKey = import.meta.env["VITE_STRIPE_CLIENT"]
    config.stripeFeePercent = import.meta.env["VITE_STRIPE_FEE_PERCENT"] === undefined ? 3.5 : Number.parseFloat(import.meta.env["VITE_STRIPE_FEE_PERCENT"])
    config.stripeFeePerSale = import.meta.env["VITE_STRIPE_FEE_PER_SALE"] === undefined ? 30 : Number.parseFloat(import.meta.env["VITE_STRIPE_FEE_PER_SALE"])
    config.appFeePercent = import.meta.env["VITE_APP_FEE_PERCENT"] === undefined ? 0 : Number.parseFloat(import.meta.env["VITE_APP_FEE_PERCENT"])
    config.appFeePerSale = import.meta.env["VITE_APP_FEE_PER_SALE"] === undefined ? 0 : Number.parseFloat(import.meta.env["VITE_APP_FEE_PER_SALE"])
</script>
