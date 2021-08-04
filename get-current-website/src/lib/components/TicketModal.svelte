<script>
    import { createEventDispatcher } from "svelte";
    import {
        getFormattedDateString,
        getTimeString,
    } from "$lib/helpers/date_utils";
    const dispatch = createEventDispatcher();

    export let ticketTypes;
    export let editIndex;
    export let ticketOption;
    // Extract values to show from ticketOption
    let startDate,
        startTime,
        endDate,
        endTime,
        quantity,
        ticketTypeId,
        ticketTypeName;
    function updateView(data) {
        startDate = data.start
            ? getFormattedDateString(new Date(data.start))
            : getFormattedDateString(new Date());
        startTime = data.start ? getTimeString(new Date(data.start)) : "00:00";
        endDate = data.end
            ? getFormattedDateString(new Date(data.end))
            : getFormattedDateString(new Date());
        endTime = data.end ? getTimeString(new Date(data.end)) : "00:00";
        quantity = data.quantity >= 0 ? data.quantity : "";
        cost = data.price / 100 || 0;
    }
    $: updateView(ticketOption);
    $: ticketTypeId =
        typeof ticketOption.ticket_type == "number"
            ? ticketOption.ticket_type
            : ticketTypes.length > 0
            ? ticketTypes[0].id
            : null;
    $: ticketTypeName =
        typeof ticketOption.ticketTypeName == "string"
            ? ticketOption.ticketTypeName
            : ticketTypes.length > 0
            ? ticketTypes[0].name
            : null;
    let cost;
    // Process data from user input.
    let start;
    let end;
    let price;
    $: start =
        startDate && startTime
            ? new Date(
                parseInt(startDate.split('-')[0]),
                parseInt(startDate.split('-')[1])-1,
                parseInt(startDate.split('-')[2]),
                parseInt(startTime.slice(0, 2)),
                parseInt(startTime.slice(3, 5))
              )
            : null;
    $: end =
        endDate && endTime
            ? new Date(
                parseInt(endDate.split('-')[0]),
                parseInt(endDate.split('-')[1])-1,
                parseInt(endDate.split('-')[2]),
                parseInt(endTime.slice(0, 2)),
                parseInt(endTime.slice(3, 5))
              )
            : null;
    $: price = Math.round(cost * 100) || 0;
    // $: console.log({
    //     start,
    //     end,
    //     startDate,
    //     startTime,
    //     endDate,
    //     endTime,
    //     quantity,
    //     ticketTypeId,
    //     ticketTypeName,
    // });

    // Event handling functions
    function addTicket(e) {
        if (!(start && end)) {
            alert("Start and end date/times should be provided.");
            e.stopPropagation();
        } else {
            if (quantity !== "" && parseInt(quantity) != quantity) {
                alert("Please enter a number value for quantity"); //@dev/amartis: Review UI
                return;
            }
            dispatch("ticketCreated", {
                ticket: {
                    start,
                    end,
                    quantity: quantity == "" ? -1 : parseInt(quantity),
                    price,
                    ticket_type: ticketTypeId,
                    ticketTypeName,
                },
            });
        }
    }
    function setType(id, name) {
        ticketTypeId = id;
        ticketTypeName = name;
    }
</script>

<div id="modal-ticket" class="modal">
    <div class="container">
        <h2>Add Ticket</h2>

        <p class="pre-title">Ticket Type</p>
        <div class="options">
            <!-- Timed Entry Ticket -->
            {#each ticketTypes as type, i}
                <button
                    class="title-tab"
                    class:active={ticketTypeId
                        ? ticketTypeId === type.id
                        : i === 0}
                    on:click={setType(type.id, type.name)}>{type.name}</button
                >
            {/each}
            <div class="ticket">
                <div class="row form-main">
                    <form action="">
                        <div class="row">
                            <div class="col-sm-6 col-xs-12">
                                <label for="start-date">Start Date</label>
                                <input
                                    type="date"
                                    name="start-date"
                                    id="start-date"
                                    bind:value={startDate}
                                    required
                                />
                            </div>
                            <div class="col-sm-6 col-xs-12">
                                <label for="start-time">Start Time</label>
                                <input
                                    type="time"
                                    name="start-time"
                                    id="start-time"
                                    bind:value={startTime}
                                    required
                                />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6 col-xs-12">
                                <label for="end-date">End Date</label>
                                <input
                                    type="date"
                                    name="end-date"
                                    id="end-date"
                                    bind:value={endDate}
                                    required
                                />
                            </div>
                            <div class="col-sm-6 col-xs-12">
                                <label for="end-time">End Time</label>
                                <input
                                    type="time"
                                    name="end-time"
                                    id="end-time"
                                    bind:value={endTime}
                                    required
                                />
                            </div>
                        </div>
                        <div class="row set-ticket">
                            <div class="col-xs-12 col-sm-6">
                                <label for="name"
                                    >Number of tickets available</label
                                >
                                <!--@dev/amartis: -->
                                <input
                                    type="number"
                                    id="quantity"
                                    bind:value={quantity}
                                    title="Leave this field blank for unlimited tickets."
                                    placeholder="Default : ∞"
                                />
                            </div>
                            <div class="col-xs-12 col-sm-6">
                                <label for="name">Price (0 = free)</label>
                                <input
                                    type="number"
                                    id="cost"
                                    step=".01"
                                    bind:value={cost}
                                />
                            </div>
                            <div class="col-xs-12 mt-20 r-text">
                                <a
                                    href="#"
                                    rel="modal:close"
                                    on:click={addTicket}
                                >
                                    {#if typeof editIndex != "number"}
                                        Add Ticket
                                    {:else}
                                        Update Ticket
                                    {/if}
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .options button.title-tab {
        -webkit-box-ordinal-group: 2;
        -ms-flex-order: 1;
        order: 1;
        width: auto;
        display: inline-block;
        padding: 1rem 2rem;
        margin-right: 0.2rem;
        cursor: pointer;
        border: solid 1px #424a80;
        background: #fff;
        color: #424a80;
        font-weight: bold;
        border-radius: 5px;
        -webkit-transition: background ease 0.2s;
        transition: background ease 0.2s;
    }

    .options button.active {
        background: #424a80;
        color: #ffffff;
    }

    .options .ticket {
        -webkit-box-ordinal-group: 100;
        -ms-flex-order: 99;
        order: 99;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
        width: 100%;
        background: #fff;
    }
    form a {
        margin-top: 10px;
        background: #424a80;
        border: none;
        color: #fff;
        outline: none;
        padding: 15px 20px;
        font-weight: 600;
        font-size: 14px;
        border-radius: 5px;
        cursor: pointer;
        width: auto;
    }
</style>