<script context="module">
    export const ssr = false;
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
	import Select from 'svelte-select';
    export async function load({ page }) {
        const fromURL = page.query.get("from") || null;
        const categoryOptions = await apiAgent.get({
            url: "/categories",
            params: { _sort: "name:ASC", token: null },
            autoRedirect: false,
            token: null,
        });
        const ticketTypes = await apiAgent.get({
            url: "/ticket-types",
            autoRedirect: false,
            token: null,
        });
        return { props: { categoryOptions, ticketTypes, fromURL } };
    }
</script>

<script>
    import { v4 as uuidv4 } from "uuid";
    import Nav from "$lib/components/Nav.svelte";
    import { onMount } from "svelte";
    import ImageUpload from "$lib/components/ImageUpload.svelte";
    import LocationModal from "$lib/components/LocationModal.svelte";
    import TicketModal from "$lib/components/TicketModal.svelte";
    import TicketCard from "$lib/components/TicketCard.svelte";
    import AddonCard from "$lib/components/AddonCard.svelte";
    import AlertModal from "$lib/components/AlertModal.svelte";

    import {
        browserGet,
        browserSet,
        browserRemove,
        browserGetPhotoFile,
        browserSetPhotoFile,
        browserRemovePhotoFile,
    } from "$lib/helpers/browser_utils";
    import {
        getFormattedDateString,
        getTimeString,
    } from "$lib/helpers/date_utils";
    import ContactModal from "$lib/components/ContactModal.svelte";
    import { config } from "$lib/helpers/config.svelte";

    export let categoryOptions;
    export let ticketTypes;
    export let fromURL;

    /**
     * Try to fecth value from local storage
     */
    function getFromStorage(key, defVal) {
        if (
            browserGet("get-current-temp-event") &&
            browserGet("get-current-temp-event")[key]
        )
            return browserGet("get-current-temp-event")[key];
        else return defVal;
    }

    // Initial Values on Page
    let error;
    let image;
    let loadedImage = { imgSrc: undefined, file: undefined };
    let name;
    let organizer;
    let phone;
    let externalLink;
    let categories;
    let location;
    let start;
    let end;
    let startDate;
    let startTime;
    let endDate;
    let endTime;
    let ticketOptions;
    let ticketOptionEditing;
    let addons;
    let addonPrice;
    let description;

    let addonDescription;
    let editIndex;
    let intSelected = "ticket";

    let latidue;
    let longitude;

    function loadEventFromStorage() {
        name = getFromStorage("name");
        organizer = getFromStorage("organizer");
        phone = getFromStorage("phone");
        externalLink = getFromStorage("externalLink");
        categories = getFromStorage("categories", []);
        location = getFromStorage("location");
        start = getFromStorage("start");
        end = getFromStorage("end");
        startDate = start ? getFormattedDateString(new Date(start)) : "";
        startTime = start ? getTimeString(new Date(start)) : "00:00";
        endDate = end ? getFormattedDateString(new Date(end)) : "";
        endTime = end ? getTimeString(new Date(end)) : "00:00";
        ticketOptions = getFromStorage("ticketOptions", []);
        ticketOptionEditing = {}; // Editing Ticket Option.
        addons = getFromStorage("addonOptions", []);
        addonPrice = 0;
        description = getFromStorage("description");
    }
    loadEventFromStorage();

    // Quill
    let editor;
    let quill;
    const toolbarOptions = [
        [{ header: 1 }, { header: 2 }, "blockquote", "link", "image", "video"],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "ordered" }],
        [{ align: [] }],
        ["clean"],
    ];

    onMount(async () => {
        const res = await browserGetPhotoFile("get-current-temp-event-image");
        image = res.file;
        loadedImage = res.imgSrc;

        const { default: Quill } = await import("quill");
        quill = new Quill(editor, {
            modules: {
                toolbar: toolbarOptions,
            },
            theme: "snow",
            placeholder: "Your event description here...",
        });
        quill.clipboard.dangerouslyPasteHTML(0, description || "");
        quill.on("text-change", () => {
            description = quill.root.innerHTML;
        });
    });

    // Reactive Variables
    $: start =
        startDate && startTime
            ? new Date(
                  parseInt(startDate.split("-")[0]),
                  parseInt(startDate.split("-")[1]) - 1,
                  parseInt(startDate.split("-")[2]),
                  parseInt(startTime.slice(0, 2)),
                  parseInt(startTime.slice(3, 5))
              )
            : null;
    $: end =
        endDate && endTime
            ? new Date(
                  parseInt(endDate.split("-")[0]),
                  parseInt(endDate.split("-")[1]) - 1,
                  parseInt(endDate.split("-")[2]),
                  parseInt(endTime.slice(0, 2)),
                  parseInt(endTime.slice(3, 5))
              )
            : null;
    $: intCategories = categories.map((x) => parseInt(x, 10));
    $: event = {
        name,
        location,
        ticketOptions,
        addonOptions: addons,
        description,
        start,
        end,
        organizer,
        phone,
        externalLink,
        categories: intCategories,
    };

    $: valid1 =
        event.name &&
        image &&
        event.location &&
        event.description &&
        event.description != "<p><br></p>" &&
        event.organizer &&
        event.phone &&
        (event.ticketOptions.length > 0 || event.externalLink ) &&
        event.categories.length > 0 &&
        start &&
        end &&
        start <= end;

    $: invalidTimeRange = start && end && start > end;

    $: text = browserGet("get-current-jwt-token")
        ? "Your event must be approved by a Get Current team member, you will be notified by email when it has been accepted and is ready to be published live."
        : "You must be registered and logged in to post an event. Click below to register / login and don't worry, we have your event details saved.";

    $: alertModalText =
        valid1
            ? text
            : !name ? "Please inpute Event name." 
            : !organizer ? "Please inpute Event organizer."
            : !/^(\d|\s|-|\(|\))*$/.test(phone) ? "Digits, spaces, hyphens and parentheses are accepted as phone number."
            : !categories.length > 0 ? "Please select Event category."
            : !location ? "Please enter Event location."
            : !(start < end) ? "Starting moment should not be later than ending moment. Please check your input." //@dev/amartis: Review English.
            : !(event.ticketOptions.length > 0 || event.externalLink ) ? "You must enter one more ticket or external link."
            : !(event.description && event.description != "<p><br></p>") ? "Please describe your event."
            : "Missing information! Addons are not required but all other fields are. Please make sure that you have completed all fields including adding at least one ticket.";

    $: submitText = browserGet("get-current-jwt-token")
        ? "Submit For Approval"
        : "Login/Register";
    $: submitLink = browserGet("get-current-jwt-token")
        ? "#"
        : "/auth/register";

    function handleUpload(event) {
        image = event.detail.file;
    }

    function addTicketOption(ticketOption) {
        if (typeof editIndex == "number") {
            ticketOption.id = ticketOptions[editIndex].id;
            ticketOptions[editIndex] = ticketOption;
            ticketOptions = [...ticketOptions];
        } else {
            ticketOption.id = uuidv4();
            ticketOptions = [...ticketOptions, ticketOption];
        }
    }

    function startEditingTicket(i) {
        if (typeof i == "number") ticketOptionEditing = ticketOptions[i];
        else ticketOptionEditing = {};
        editIndex = i;
    }

    function addAddon(addon) {
        if (!addon.description) {
            alert("You must provide a description for an addon");
            return;
        }
        addons = [...addons, addon];
        addonDescription = undefined;
        addonPrice = 0;
    }

    function removeAddon(i) {
        addons = addons.slice(0, i).concat(addons.slice(i + 1, addons.length));
    }

    function removeTicket(i) {
        ticketOptions = ticketOptions
            .slice(0, i)
            .concat(ticketOptions.slice(i + 1, ticketOptions.length));
    }

    function discardEvent() {
        browserRemove("get-current-temp-event");
        loadEventFromStorage();
        browserRemove("get-current-temp-event-image");
        browserRemove("get-current-temp-event-image-file-name");
        loadedImage = null;

        name = image = location = organizer = phone = undefined;
        ticketOptions = [];
        addons = [];
        categories = [];
        description = "";
        quill.root.innerHTML = "";
        addonDescription = "";
        addonPrice = 0;
    }

    function tempSaveEvent() {
        browserSet("get-current-temp-event", event);
        if (image) {
            browserSetPhotoFile("get-current-temp-event-image", image);
        }
        error = undefined;
    }

    async function submitEvent() {
        const form = new FormData();
        event.status = "draft";
        form.append("data", JSON.stringify(event));
        form.append("files.image", image, image.name);

        try {
            await apiAgent.post({ url: "/events", body: form });
            discardEvent();
            if (fromURL) {
                window.location.href = fromURL;
            } else {
                window.location.href =
                    config.dashboardURL +
                    "/?token=" +
                    JSON.parse(localStorage.getItem("get-current-jwt-token"));
            }
        } catch (err) {
            error = err.message;
            alert(
                "Some error occurred while submitting your event for approval."
            );
        }
    }

    async function onDiscardEvent() {
        discardEvent();
        if (fromURL) {
            window.location.href = fromURL;
        }
    }
</script>

<svelte:head>
    <title>Create an Event</title>
</svelte:head>

<LocationModal on:locationSet={(e) => (location = e.detail)} />

<TicketModal
    {ticketTypes}
    on:ticketCreated={(e) => addTicketOption(e.detail.ticket)}
    {editIndex}
    ticketOption={ticketOptionEditing}
/>

<!-- Start alert Modal -->
<AlertModal
    text={alertModalText}
    submitLink={valid1 ? submitLink : null}
    submitText={valid1 ? submitText : null}
    backText="Back"
    on:success={submitEvent}
/>
<!-- End alert Modal -->
<ContactModal />
<Nav />

<!-- Start Content -->
<div class="container">
    <div class="row">
        <div
            class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1 col-xs-12"
        >
            <div class="form-main mt-30 mb-80">
                <h2>Create an event</h2>
                <div class="mt-10" />
                <div class="row">
                    <div class="col-md-12 col-xs-12 dz">
                        <ImageUpload
                            on:upload={handleUpload}
                            imgSrc={loadedImage}
                        />
                        <div class="mt-10" />
                    </div>
                </div>

                <form action="#" class="mt-10">
                    <!-- Name -->
                    <label for="name">Event Name</label>
                    <input
                        type="text"
                        bind:value={name}
                        class:bad={!(valid1) && !name}
                    />

                    <!-- Organizer -->
                    <label for="organizer">Organizer Name</label>
                    <input
                        type="text"
                        bind:value={organizer}
                        class:bad={!(valid1) && !organizer}
                    />

                    <!-- Contact Phone -->
                    <label for="phone">Contact Phone</label>
                    <input
                        type="tel"
                        pattern="^(\d|\s|-|\(|\))*$"
                        title="Digits, spaces, hyphens and parentheses are allowed."
                        bind:value={phone}
                        class:bad={!(valid1) &&
                            (!phone || !/^(\d|\s|-|\(|\))*$/.test(phone))}
                    />

                    <!-- Category & Location -->
                    <div class="row">
                        <div class="col-md-6 col-xs-12">
                            <label for="category-event">Category</label>
                            <Select items={categoryOptions} isMulti={true} optionIdentifier="id" labelIdentifier="name"></Select>
                        </div>

                        <div class="col-md-6 col-xs-12">
                            <h3>Location</h3>
                            {#if location}
                                <p>{location.street || ""}</p>
                                <p>{location.city || ""}</p>
                                <p class="location">
                                    <a href="#modal-location" rel="modal:open">
                                        Edit location <span
                                            ><img
                                                src="/assets/img/icon/edit.svg"
                                                alt=""
                                            /></span
                                        >
                                    </a>
                                </p>
                            {:else}
                                <p class="location">
                                    <a
                                        style="color:#FAA8A8"
                                        href="#modal-location"
                                        rel="modal:open"
                                    >
                                        Add location <span
                                            ><img
                                                src="/assets/img/icon/edit-red.svg"
                                                alt=""
                                            /></span
                                        >
                                    </a>
                                </p>
                            {/if}
                        </div>
                    </div>

                    <div class="line" />
                    <div class="mt-40" />

                    <!-- Ticketing -->
                    <h3>Ticketing</h3>
                    <div class="row">
                        <div class="col-md-4 col-xs-12">
                            <label for="startevent">Start Date</label>
                            <input
                                type="date"
                                name="startevent"
                                id="startevent"
                                bind:value={startDate}
                                class:bad={!(valid1) &&
                                    (!startDate || startDate > endDate)}
                                required
                            />
                        </div>
                        <div class="col-md-4 col-xs-12">
                            <label for="starttime">Start Time</label>
                            <input
                                type="time"
                                name=""
                                id="starttime"
                                bind:value={startTime}
                                class:bad={!(valid1) &&
                                    (!startTime ||
                                        (startDate == endDate && start > end))}
                                required
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4 col-xs-12">
                            <label for="endevent">End Date</label>
                            <input
                                type="date"
                                name="endevent"
                                id="endevent"
                                bind:value={endDate}
                                class:bad={!(valid1) &&
                                    (!endDate || startDate > endDate)}
                                required
                            />
                        </div>
                        <div class="col-md-4 col-xs-12">
                            <label for="endtime">End Time</label>
                            <input
                                type="time"
                                name=""
                                id="endtime"
                                bind:value={endTime}
                                class:bad={!(valid1) &&
                                    (!startTime ||
                                        (startDate == endDate && start > end))}
                                required
                            />
                        </div>
                    </div>

                    <div class="row mt-30">
                        <div class="col-xs-12">
                            <div class="tab-bar">
                                <ul>
                                    <li>
                                        <a
                                            href="/event/create"
                                            class={intSelected == "ticket"
                                                ? "active"
                                                : ""}
                                            on:click={() => {
                                                // categoryName = "";
                                                // getEvenfromRangeDateAndName();
                                                intSelected = "ticket";
                                            }}
                                            >Event ticket
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/event/create"
                                            class={intSelected == "url"
                                                ? "active"
                                                : ""}
                                            on:click={() => {
                                                // categoryName = "";
                                                // getEvenfromRangeDateAndName();
                                                intSelected = "url";
                                            }}
                                            >Existing Event / URL
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {#if intSelected == "ticket"}
                            {#each ticketOptions as ticketOption, i (ticketOption.id)}
                                <TicketCard
                                    {ticketOption}
                                    on:delete={(e) => removeTicket(i)}
                                    on:edit={(e) => startEditingTicket(i)}
                                />
                            {/each}

                            <!-- Start Add Ticket -->
                            <div class="col-md-6 col-xs-12">
                                <a
                                    href="#modal-ticket"
                                    rel="modal:open"
                                    on:click={(e) => {
                                        ticketOptionEditing = {};
                                        startEditingTicket(null);
                                    }}
                                >
                                    <div
                                        class="ticket-new"
                                        class:bad={ticketOptions.length <= 0}
                                    >
                                        <div class="v-line">
                                            <div class="t-dot" />
                                            <b class="b-dot" />
                                        </div>
                                        <div class="new-ticket">
                                            <p><span>+</span> Add new Ticket</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <!-- End Add Ticket -->
                        {/if}
                        {#if intSelected == "url"}
                            <label for="name">Link</label> <br />
                            <input
                                type="text"
                                placeholder="https://example.com"
                                bind:value={externalLink}
                            />
                        {/if}
                    </div>

                    <div class="line" />
                    <div class="mt-30" />

                    <h3>Addons</h3>
                    <div class="mt-10" />
                    {#each addons as addon, i}
                        <AddonCard {addon} on:delete={(e) => removeAddon(i)} />
                    {/each}
                    <div class="row addons middle-md">
                        <div class="col-md-7 col-xs-12">
                            <label for="name">Addon Description</label> <br />
                            <input type="text" bind:value={addonDescription} />
                        </div>

                        <div class="col-md-3 col-xs-5">
                            <label for="">Price (0 = free)</label>
                            <input
                                type="number"
                                step=".01"
                                bind:value={addonPrice}
                            />
                        </div>
                    </div>
                    <div class="mt-20" />
                    <a
                        class="main-btn"
                        href="#"
                        on:click|preventDefault={() =>
                            addAddon({
                                description: addonDescription,
                                price: parseInt(addonPrice * 100),
                            })}>Add</a
                    >

                    <!-- Desc -->
                    <div class="line" />
                    <div class="mt-30" />
                    <!-- <label for="info">Description</label> -->
                    <p
                        style="font-size: 14px;
                    margin-top: 20px;
                    margin-bottom: 5px;
                    font-weight: 700;
                    color: #818181;"
                    >
                        Description
                    </p>
                    <div class="mt-30" />
                    <div class="editor-wrapper">
                        <div bind:this={editor} />
                    </div>
                    <div class="mt-10" />
                </form>
            </div>
        </div>
    </div>
</div>

<div class="bottom-section">
    <div class="container r-text">
        <div class="row">
            <div class="col-xs-12">
                {#if error}<p class="error">{error}</p>{/if}
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12">
                <ul class="btn-bottom">
                    <li>
                        <a class="main-btn-2" href="#" on:click={onDiscardEvent}
                            >Discard</a
                        >
                    </li>
                    <li>
                        <a
                            class="main-btn"
                            href="#modal-alert"
                            rel="modal:open"
                            on:click={tempSaveEvent}>Submit for Approval</a
                        >
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

<style>
    @import "$lib/components/Quill/quill.snow.css";

    .error {
        color: red;
        margin-bottom: 20px;
    }
    select.bad,
    textarea.bad,
    input.bad {
        border: 2px solid #faa8a8;
    }
    /* label.bad,
    h3.bad {
        color:#FA8888;
    } */

    .ticket-new.bad {
        border: 2px solid #faa8a8;
    }
    .ticket-new.bad .t-dot,
    .ticket-new.bad .b-dot {
        border-top: 2px solid #faa8a8;
        border-bottom: 2px solid #faa8a8;
        border-right: 2px solid #faa8a8;
    }
    .ticket-new.bad::after {
        border-top: 2px solid #faa8a8;
        border-bottom: 2px solid #faa8a8;
        border-right: 2px solid #faa8a8;
    }
    .ticket-new.bad .v-line {
        border-right: 2px dashed #faa8a8;
    }
    .ticket-new.bad p {
        color: #fa8888;
    }

    #category-event {
        width: 65%;
    }
    .tab-bar {
        margin-bottom: 30px;
    }

    .tab-bar ul {
        list-style: none;
    }

    .tab-bar ul li {
        display: inline;
    }

    .tab-bar ul li a {
        margin-right: 10px;
        border: 1px solid #424a80;
        padding: 10px 20px;
        border-radius: 5px;
    }

    .tab-bar ul li a:hover {
        opacity: 0.9;
    }

    .tab-bar ul li a.active {
        background: #424a80;
        color: #fff;
    }

    .tab-bar ul li a.active:hover {
        opacity: 1;
    }
    @media (max-width: 764px) {
        /* xs- size */
        #category-event {
            width: 100%;
        }

        .tab-bar ul li a {
            margin-right: 10px;
            border: 1px solid #424a80;
            padding: 5px 8px;
            border-radius: 5px;
            font-size: 11px;
        }
    }
</style>
