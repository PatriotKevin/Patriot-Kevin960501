<script>
    import {browser} from '$app/env'

    function reload(){
        if(browser) {
            location.replace('/')
        }
    }
</script>

<h1>404 - Page not found</h1>
<p>We couldn't seem to find the page you are looking for!</p>
<a href="#" on:click={reload}>Go Home</a>

<style>
    h1 {
        margin-top: 10px;
        text-align: center;
    }
    p {
        margin-top: 40px;
        font-size: 18px;
        text-align: center;
    }
    a {
        display: block;
        width: 100px;
        margin: 20px auto;
    }
</style>