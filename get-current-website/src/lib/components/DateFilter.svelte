<script context="module">

</script>

<script>
    import { createEventDispatcher } from "svelte";

    import {
        getFormattedDateString,
        getTimeString,
    } from "$lib/helpers/date_utils";
    const dispatch = createEventDispatcher();
    let startDate, endDate;
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    startDate = getFormattedDateString(today);
    endDate = getFormattedDateString(new Date("2030-01-01"));
</script>

<!-- Date Field -->
<div class="container">
    <div class="row">
        <div class="col-md-4 col-md-offset-8 col-xs-12">
            <!-- filter field -->
            <div class="filter" id="DateFilter">
                <form action="">
                    <div class="row">
                        <!-- Start Date -->
                        <div class="col-md-6 col-xs-12 mt-20">
                            <label for="StartDate">Start Date</label>
                            <input
                                type="date"
                                name="start-date"
                                id="start-date"
                                bind:value={startDate}
                            />
                        </div>

                        <!-- End Date -->
                        <div class="col-md-6 col-xs-12 mt-20">
                            <label for="EndDate">End Date</label>
                            <input
                                type="date"
                                name="end-date"
                                id="end-date"
                                bind:value={endDate}
                            />
                        </div>

                        <!-- OK button -->
                        <div class="col-md-12 col-xs-12 mt-20">
                            <div class="fitter-btn-list">
                                <ul>
                                    <li>
                                        <button
                                            class="main-btn"
                                            on:click={() =>
                                                dispatch("pickDate", {
                                                    daterange: {
                                                        startDate,
                                                        endDate,
                                                    },
                                                })}>Search by date</button
                                        >
                                    </li>
                                    <li>
                                        <button
                                            class="main-btn cnc"
                                            on:click={() => dispatch("close")}
                                            >Cancel</button
                                        >
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- End Event Bar -->
<style>
    .filter {
        padding: 5px 20px 20px 20px;
        background: #fff;
        box-shadow: 0px 3px 5px 1px rgba(0, 0, 0, 0.04);
        border-radius: 5px;
        margin-bottom: 20px;
        margin-top: 10px;
    }

    .filter .main-btn.cnc {
        background: #dfdfdf;
        border-color: #dfdfdf;
        color: rgb(61, 61, 61);
        cursor: pointer;
    }

    .filter .main-btn {
        cursor: pointer;
    }

    .filter label {
        text-align: left;
    }

    .filter input,
    .filter select {
        padding: 10px;
        border: none;
        width: 100%;
        outline: none;
        background: #edeff5;
    }

    .fitter-btn-list ul {
        list-style: none;
    }

    .fitter-btn-list ul li {
        display: inline-block;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        margin: 0;
    }
</style>
