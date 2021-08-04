<script>
    const authenticated = false;
</script>

<div class="navbar">
    <div class="container">
        <div class="row">
            <!-- logo -->
            <div class="col-md-2 col-xs-4 first-xs">
                <div class="logo">
                    <a href="/">
                        <img
                            src="/assets/img/logo.png"
                            alt="Get Current logo"
                        />
                    </a>
                </div>
            </div>

            <!-- nav -->
            <div class="col-md-7 col-xs-4">
                <div class="nav-f">
                    <a href="https://getcurrent.ca/for-events" target="_blank"
                        >Get Current for Events</a
                    >
                    <a href="https://getcurrent.ca/business/" target="_blank"
                        >Get Current for Business</a
                    >
                    <a href="#modal-message" rel="modal:open">Contact Us</a>
                </div>
            </div>

            <!-- button -->
            {#if !authenticated}
                <div class="col-md-3 col-xs-4 last-xs r-text">
                    <div class="nav-btn">
                        <a class="main-btn" href="/event/create"
                            >Create&nbsp;event!</a
                        >
                    </div>
                </div>
            {:else}
                <div class="col-md-3 col-xs-4 last-xs r-text">
                    <div class="account-btn">
                        <p>Account</p>
                        <img
                            class="account-img"
                            src="/assets/img/icon/user.svg"
                            alt=""
                        />
                    </div>
                </div>
            {/if}
        </div>
        {#if authenticated}
            <div id="account-panel">
                <div class="account-menu">
                    <ul class="account-menu-list">
                        <!-- TODO: Fix environment variables -->
                        <li>
                            <a
                                href="https://get-current-dashboard.daydream.software/"
                                >Dashboard</a
                            >
                        </li>
                        <li><a href="/create-event.html">Create Event</a></li>
                        <li><a href="/">Logout</a></li>
                    </ul>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .nav-f a {
        margin-right: 20px;
    }
    @media (max-width: 764px) {
        .nav-btn .main-btn {
            display: block;
            text-align: center;
            margin-top: -5px;
        }

        .nav-f {
            display: none;
        }

        .logo {
            margin-top: 4px;
        }
    }
    @media (max-width: 300px) {
        .nav-btn .main-btn {
            font-size: 8px;
        }
    }
</style>
