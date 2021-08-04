<script>
    import { createEventDispatcher } from 'svelte';
    import { prevent_default, stop_propagation } from 'svelte/internal';
    import LibLoader from '$lib/helpers/LibLoader.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte';
    import { config } from '$lib/helpers/config.svelte'

    const dispatch = createEventDispatcher()

    let googleApiReady = false
    let street
    let streetAdd
    let postalCode
    let city
    let country
    let province
    let venueName
    $: mapData = street || streetAdd || postalCode || city || country || province
    let latitude
    let longitude

    
    const initLoc = { lat: 55, lng: -80 };
    let map
    let marker

    const saveLocation = (e) => {
        if (!street || !postalCode) {
            alert('Address 1 and Postal Code are required.') // @dev/amartis : Review English messages.
            e.stopPropagation()
            return
        }
        if (typeof latitude != 'number' || typeof longitude != 'number') {
            alert('The location of the event is not picked.') // @dev/amartis : Review English messages.
            e.stopPropagation()
            return
        }
        dispatch('locationSet', {
            street,
            streetAdd,
            postalCode,
            city,
            country,
            province,
            venueName,
            latitude,
            longitude
        })
    }
    const onMapJsLoaded = () => {
        console.log('onMapJsLoaded')
        setTimeout(() => {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 4,
                center: initLoc,
            });
            googleApiReady = true
        }, 2000)
    }
    const prepAddressComponent = (component) => component
    let lastQuery = null
    const geoCode = async (_ready, _street, _streetAdd, _postalCode, _city, _country, _province, _venueName) => {
        if (!_ready || !mapData) return
        let addressComponents = []
        let zoom = 4
        if (_venueName) {
            addressComponents.push(prepAddressComponent(_venueName))
            zoom = Math.max(zoom, 17)
        }
        if (_street) {
            addressComponents.push(prepAddressComponent(_street))
            zoom = Math.max(zoom, 16)
        }
        if (_streetAdd) {
            addressComponents.push(prepAddressComponent(_streetAdd))
            zoom = Math.max(zoom, 16)
        }
        if (_postalCode) {
            addressComponents.push(prepAddressComponent(_postalCode))
            zoom = Math.max(zoom, 11)
        }
        if (_city) {
            addressComponents.push(prepAddressComponent(_city))
            zoom = Math.max(zoom, 14)
        }
        if (_province) {
            addressComponents.push(prepAddressComponent(_province))
            zoom = Math.max(zoom, 7)
        }
        if (_country) {
            addressComponents.push(prepAddressComponent(_country))
            zoom = Math.max(zoom, 4)
        }
        let address = addressComponents.join(',')
        try {
            let geoInfo = await apiAgent.get({
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                token: null,
                headers: {},
                params: {
                    address,
                    key: config.googleApiKey
                },
                autoRedirect: false
            })
            if (geoInfo.status != "OK" || geoInfo.results.length <= 0) {
                latitude = null
                longitude = null
                marker.setMap(null)
                map.setCenter(new google.maps.LatLng(initLoc.lat, initLoc.lng))
                map.setZoom(4)
                return
            }
            latitude = geoInfo.results[0].geometry.location.lat
            longitude = geoInfo.results[0].geometry.location.lng
            if (marker) {
                // delete marker
                marker.setMap(null)
            }
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(latitude, longitude),
                map:map
            })
            map.setCenter(new google.maps.LatLng(latitude, longitude))
            map.setZoom(zoom)
        }
        catch (error) {
            // alert(error.message)
        }
    }
    const geoCodeBuffer = async (_ready, _street, _streetAdd, _postalCode, _city, _country, _province, _venueName) => {
        if (!_ready || !mapData) return
        const myMoment = Date.now()
        if (!lastQuery || lastQuery.moment < myMoment) {
            lastQuery = {moment:myMoment, _ready, _street, _streetAdd, _postalCode, _city, _country, _province, _venueName}
        }
        else {
            return
        }
        setTimeout(() => {
            if (lastQuery && lastQuery.moment != myMoment) return // Check if the query survived.
            const {_ready, _street, _streetAdd, _postalCode, _city, _country, _province, _venueName} = lastQuery
            geoCode(_ready, _street, _streetAdd, _postalCode, _city, _country, _province, _venueName)
        }, 1000)
    }
    $: geoCodeBuffer(googleApiReady, street, streetAdd, postalCode, city, country, province, venueName)
</script>

<LibLoader url={`https://maps.googleapis.com/maps/api/js?key=${config.googleApiKey}&callback=&libraries=&v=weekly`} on:loaded={onMapJsLoaded} async={true}/>

<div id="modal-location" class="modal">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-xs-12">
                <div class="modal-content form-main">
                    <h2>Add Location</h2>
                    <p>Help people in the area discover your event.</p>
                    <div class="mt-20"></div>
                    <!-- {#if mapData} -->
                    <!-- <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA3eS2EqXreCnJp7O2451VlWsmagbjng3M&q=${street ? street + '+' : ''}${streetAdd ? streetAdd + ',+' : ''}${city ? city + ',+' : ''}${province ? province + ',+' : ''}${country || ''}`}
                            width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen=""
                            aria-hidden="false" tabindex="0"></iframe> -->
                        <div id = "map"></div>
                    <!-- {:else} -->
                    {#if !mapData}
                        <div>
                            <p style="text-align: center; margin-top:50px;">Fill out the form below to see a preview of your location.</p>
                        </div>
                    {/if}
                    <div class="row">
                        <div class="col-md-12 col-xs-12">
                            <!-- Name -->
                            <label>Venue Name</label>
                            <input type="text" bind:value={venueName}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>Address 1</label>
                            <input type="text" bind:value={street}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>Address 2</label>
                            <input type="text" bind:value={streetAdd}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>City</label>
                            <input type="text" bind:value={city}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>State/Province</label>
                            <input type="text" bind:value={province}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>Postal Code</label>
                            <input type="text" bind:value={postalCode}/>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <!-- Name -->
                            <label>Country</label>
                            <input type="text" bind:value={country}/>
                        </div>
                    </div>

                    <div class="mt-20"></div>
                    <a class="main-btn" href="#" rel="modal:close" on:click={saveLocation}>Save Location</a>

                </div>
            </div>
        </div>
    </div>
</div>
<style>
    .map-preview {
        max-height: 300px;
        min-height: 300px;
    }
    .map-preview p {
        text-align: center;
        margin-top: 100px;
    }

    #map {
        height: 400px;
        /* The height is 400 pixels */
        width: 100%;
        /* The width is the width of the web page */
    }

</style>