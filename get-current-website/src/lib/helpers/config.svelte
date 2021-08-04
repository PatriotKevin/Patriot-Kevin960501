<script context="module">
    export let config = {
        pageSize: 6,
    };
    config.getServerURL = function (url) {
        if (url[0] == "/") return `${config.serverURL}${url}`;
        else if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;
        else return `${config.serverURL}/${url}`;
    };
    config.getWebsiteURL = function (url) {
        if (url[0] == "/") return `${config.websiteURL}${url}`;
        else if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;
        else return `${config.websiteURL}/${url}`;
    };
    config.getDashboardURL = function (url) {
        if (url[0] == "/") return `${config.dashboardURL}${url}`;
        else if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
            return url;
        else return `${config.dashboardURL}/${url}`;
    };
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
    config.googleApiKey = import.meta.env["VITE_GOOGLE_API_KEY"]
    config.serverURL = import.meta.env["VITE_API_SERVER_URL"]
    config.dashboardURL = import.meta.env["VITE_DASHBOARD_URL"]
    config.websiteURL = import.meta.env["VITE_WEBSITE_URL"]
    config.stripeClientKey = import.meta.env["VITE_STRIPE_CLIENT"]
    config.sponsorDistance = Number.parseInt(import.meta.env["VITE_SPONSOR_DISTANCE"]) // in meters
    config.sponsorMaxPremium = Number.parseInt(import.meta.env["VITE_SPONSOR_MAX_PREMIUM"])
    config.sponsorMaxRegular = Number.parseInt(import.meta.env["VITE_SPONSOR_MAX_REGULAR"])
</script>
