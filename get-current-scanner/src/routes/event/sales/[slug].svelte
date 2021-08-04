<script context="module">
    export const ssr = false;
    import { config } from '$lib/helpers/config.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    import { browser } from '$app/env'
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    import { getEventDates, getEventTimes } from '$lib/helpers/date_utils'
    import _reduce from '$lib/lodash/reduce'
    export async function load({page}) {
        // @dev/amartis: temporary fix due to sveltekit issue.
        if (!page.params.slug) {
            page.params.slug = page.path.substr(page.path.lastIndexOf('/')+1)
        }
        console.log(new Date(), page)
        const event = await apiAgent.get({url:`/events/${page.params.slug}`})
        // const tickets = await apiAgent.get({url:`/tickets`, params:{"event.id":page.params.slug, "status":["paid","redeemed","withdrawn"]}})
        // let eventTransactions = {}
        // let eventSales = 0
        // tickets.forEach(ticket => {
        //     let paymentOnTicket = ticket.price
        //     for (const addon of ticket.addons || []) {
        //         paymentOnTicket += addon.price
        //     }
        //     if (!eventTransactions[ticket.stripeIntentId]) {
        //         eventTransactions[ticket.stripeIntentId] = 0
        //     }
        //     eventTransactions[ticket.stripeIntentId] += paymentOnTicket
        //     eventSales += paymentOnTicket
        // });
        // const eventTransactionsCount = _reduce(eventTransactions, (count, val, key) => (count + (val>0 ? 1 : 0)), 0)
        // const eventFee = config.getFee(eventSales, eventTransactionsCount)
        // const eventRevenue = eventSales - eventFee
        return { props: { event }}
    }
</script>
    
<script>
    import { onMount } from 'svelte';
    import { price_number } from '$lib/helpers/num_utils'
import update from '$lib/lodash/update';
    export let event
    let balance = 'Summing up...'
    let pending = 'Summing up...'
    let eventSales = 'Summing up...'
    let eventFee = 'Summing up...'
    let eventRevenue = 'Summing up...'

    const fetchBalance = async () => {
      try {
        const balanceInfo = await apiAgent.get({url:`/payout/balance`, params: {focusEvent: event.id}})
        balance = balanceInfo.balance
        pending = balanceInfo.pending
        eventSales = balanceInfo.focusEventStats.sales
        eventRevenue = balanceInfo.focusEventStats.revenue
        // eventFee may not be same as eventSales - eventRevenue
        eventFee = -(balanceInfo.focusEventStats.stripeFee + balanceInfo.focusEventStats.appFee)
      }
      catch (error) {
        alert(`Some error occurred while fetching sales and balance information. \n ${error.message}` )
      }
    }
    fetchBalance()

    let withdrawAmount = 0
    let withdrawn = false
    const withdraw = async () => {
        withdrawn = false
        try {
            const transfer = await apiAgent.post({url:'/payout/withdraw', body:{amount:withdrawAmount*100}})
            withdrawn = true
            if (confirm(`Paid out successfully. Would you check your Stripe dashboard?`)) { // @dev/amartis: Review English message.
                const apiResponse = await apiAgent.post({url:'/payout/account'})
                window.location.href = apiResponse.redirect
            }
            else {
              balance = 'Summing up...'
              pending = 'Summing up...'
              fetchBalance()
            }
        } catch (error) {
            alert(
                error.message ||
                "Sorry, some error occurred while processing your request."
            )
        }
    }

    const setLimitOnWithdraw = (withdraw_, balance_) => {
        if (typeof balance_ != "number") {
          withdrawAmount = 0
        }
        if (typeof balance_ == "number" && typeof withdraw_ == "number") {
            withdrawAmount = Math.max(Math.min(withdrawAmount, (balance/100).toFixed(2)),0)
        }
    }
    $: setLimitOnWithdraw(withdrawAmount, balance)
    // onMount(() => {
    //     // The info button
    //     setTimeout(() => {
    //     // $(document).ready(() => {
    //             jQuery('.info').popover();
    //             jQuery(':not(#anything)').on('click', function (e) {
    //                 jQuery('.info').each(function () {
    //                     //the 'is' for buttons that trigger popups
    //                     //the 'has' for icons and other elements within a button that triggers a popup
    //                     if (!jQuery(this).is(e.target) && jQuery(this).has(e.target).length === 0 && jQuery('.popover').has(e.target).length === 0) {
    //                         jQuery(this).popover('hide');
    //                         return;
    //                     }
    //                 });
    //             });
    //         // })
    //         }, 1000)
    // })
    // const activateInfoButton = () => {
    //     jQuery('.info').popover();
    //     jQuery(':not(#anything)').on('click', function (e) {
    //         jQuery('.info').each(function () {
    //             //the 'is' for buttons that trigger popups
    //             //the 'has' for icons and other elements within a button that triggers a popup
    //             if (!jQuery(this).is(e.target) && jQuery(this).has(e.target).length === 0 && jQuery('.popover').has(e.target).length === 0) {
    //                 jQuery(this).popover('hide');
    //                 return;
    //             }
    //         });
    //     });
    // }
    
</script>

<svelte:head>
    <script>
            
        /* ===========================================================
        * bootstrap-tooltip.js v2.3.2
        * http://twitter.github.com/bootstrap/javascript.html#tooltips
        * Inspired by the original jQuery.tipsy by Jason Frame
        * ===========================================================
        * Copyright 2012 Twitter, Inc.
        *
        * Licensed under the Apache License, Version 2.0 (the "License");
        * you may not use this file except in compliance with the License.
        * You may obtain a copy of the License at
        *
        * http://www.apache.org/licenses/LICENSE-2.0
        *
        * Unless required by applicable law or agreed to in writing, software
        * distributed under the License is distributed on an "AS IS" BASIS,
        * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        * See the License for the specific language governing permissions and
        * limitations under the License.
        * ========================================================== */
        
        
        !function ($) {
        
         "use strict"; // jshint ;_;
        
        
        /* TOOLTIP PUBLIC CLASS DEFINITION
         * =============================== */
        
         var Tooltip = function (element, options) {
           this.init('tooltip', element, options)
         }
        
         Tooltip.prototype = {
        
           constructor: Tooltip
        
         , init: function (type, element, options) {
             var eventIn
               , eventOut
               , triggers
               , trigger
               , i
        
             this.type = type
             this.$element = $(element)
             this.options = this.getOptions(options)
             this.enabled = true
        
             triggers = this.options.trigger.split(' ')
        
             for (i = triggers.length; i--;) {
               trigger = triggers[i]
               if (trigger == 'click') {
                 this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
               } else if (trigger != 'manual') {
                 eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
                 eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
                 this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                 this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
               }
             }
        
             this.options.selector ?
               (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
               this.fixTitle()
           }
        
         , getOptions: function (options) {
             options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)
        
             if (options.delay && typeof options.delay == 'number') {
               options.delay = {
                 show: options.delay
               , hide: options.delay
               }
             }
        
             return options
           }
        
         , enter: function (e) {
             var defaults = $.fn[this.type].defaults
               , options = {}
               , self
        
             this._options && $.each(this._options, function (key, value) {
               if (defaults[key] != value) options[key] = value
             }, this)
        
             self = $(e.currentTarget)[this.type](options).data(this.type)
        
             if (!self.options.delay || !self.options.delay.show) return self.show()
        
             clearTimeout(this.timeout)
             self.hoverState = 'in'
             this.timeout = setTimeout(function() {
               if (self.hoverState == 'in') self.show()
             }, self.options.delay.show)
           }
        
         , leave: function (e) {
             var self = $(e.currentTarget)[this.type](this._options).data(this.type)
        
             if (this.timeout) clearTimeout(this.timeout)
             if (!self.options.delay || !self.options.delay.hide) return self.hide()
        
             self.hoverState = 'out'
             this.timeout = setTimeout(function() {
               if (self.hoverState == 'out') self.hide()
             }, self.options.delay.hide)
           }
        
         , show: function () {
             var $tip
               , pos
               , actualWidth
               , actualHeight
               , placement
               , tp
               , e = $.Event('show')
        
             if (this.hasContent() && this.enabled) {
               this.$element.trigger(e)
               if (e.isDefaultPrevented()) return
               $tip = this.tip()
               this.setContent()
        
               if (this.options.animation) {
                 $tip.addClass('fade')
               }
        
               placement = typeof this.options.placement == 'function' ?
                 this.options.placement.call(this, $tip[0], this.$element[0]) :
                 this.options.placement
        
               $tip
                 .detach()
                 .css({ top: 0, left: 0, display: 'block' })
        
               this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
        
               pos = this.getPosition()
        
               actualWidth = $tip[0].offsetWidth
               actualHeight = $tip[0].offsetHeight
        
               switch (placement) {
                 case 'bottom':
                   tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
                   break
                 case 'top':
                   tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
                   break
                 case 'left':
                   tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
                   break
                 case 'right':
                   tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
                   break
               }
        
               this.applyPlacement(tp, placement)
               this.$element.trigger('shown')
             }
           }
        
         , applyPlacement: function(offset, placement){
             var $tip = this.tip()
               , width = $tip[0].offsetWidth
               , height = $tip[0].offsetHeight
               , actualWidth
               , actualHeight
               , delta
               , replace
        
             $tip
               .offset(offset)
               .addClass(placement)
               .addClass('in')
        
             actualWidth = $tip[0].offsetWidth
             actualHeight = $tip[0].offsetHeight
        
             if (placement == 'top' && actualHeight != height) {
               offset.top = offset.top + height - actualHeight
               replace = true
             }
        
             if (placement == 'bottom' || placement == 'top') {
               delta = 0
        
               if (offset.left < 0){
                 delta = offset.left * -2
                 offset.left = 0
                 $tip.offset(offset)
                 actualWidth = $tip[0].offsetWidth
                 actualHeight = $tip[0].offsetHeight
               }
        
               this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
             } else {
               this.replaceArrow(actualHeight - height, actualHeight, 'top')
             }
        
             if (replace) $tip.offset(offset)
           }
        
         , replaceArrow: function(delta, dimension, position){
             this
               .arrow()
               .css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
           }
        
         , setContent: function () {
             var $tip = this.tip()
               , title = this.getTitle()
        
             $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
             $tip.removeClass('fade in top bottom left right')
           }
        
         , hide: function () {
             var that = this
               , $tip = this.tip()
               , e = $.Event('hide')
        
             this.$element.trigger(e)
             if (e.isDefaultPrevented()) return
        
             $tip.removeClass('in')
        
             function removeWithAnimation() {
               var timeout = setTimeout(function () {
                 $tip.off($.support.transition.end).detach()
               }, 500)
        
               $tip.one($.support.transition.end, function () {
                 clearTimeout(timeout)
                 $tip.detach()
               })
             }
        
             $.support.transition && this.$tip.hasClass('fade') ?
               removeWithAnimation() :
               $tip.detach()
        
             this.$element.trigger('hidden')
        
             return this
           }
        
         , fixTitle: function () {
             var $e = this.$element
             if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
               $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
             }
           }
        
         , hasContent: function () {
             return this.getTitle()
           }
        
         , getPosition: function () {
             var el = this.$element[0]
             return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
               width: el.offsetWidth
             , height: el.offsetHeight
             }, this.$element.offset())
           }
        
         , getTitle: function () {
             var title
               , $e = this.$element
               , o = this.options
        
             title = $e.attr('data-original-title')
               || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
        
             return title
           }
        
         , tip: function () {
             return this.$tip = this.$tip || $(this.options.template)
           }
        
         , arrow: function(){
             return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
           }
        
         , validate: function () {
             if (!this.$element[0].parentNode) {
               this.hide()
               this.$element = null
               this.options = null
             }
           }
        
         , enable: function () {
             this.enabled = true
           }
        
         , disable: function () {
             this.enabled = false
           }
        
         , toggleEnabled: function () {
             this.enabled = !this.enabled
           }
        
         , toggle: function (e) {
             var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
             self.tip().hasClass('in') ? self.hide() : self.show()
           }
        
         , destroy: function () {
             this.hide().$element.off('.' + this.type).removeData(this.type)
           }
        
         }
        
        
        /* TOOLTIP PLUGIN DEFINITION
         * ========================= */
        
         var old = $.fn.tooltip
        
         $.fn.tooltip = function ( option ) {
           return this.each(function () {
             var $this = $(this)
               , data = $this.data('tooltip')
               , options = typeof option == 'object' && option
             if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
             if (typeof option == 'string') data[option]()
           })
         }
        
         $.fn.tooltip.Constructor = Tooltip
        
         $.fn.tooltip.defaults = {
           animation: true
         , placement: 'top'
         , selector: false
         , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
         , trigger: 'hover focus'
         , title: ''
         , delay: 0
         , html: false
         , container: false
         }
        
        
        /* TOOLTIP NO CONFLICT
         * =================== */
        
         $.fn.tooltip.noConflict = function () {
           $.fn.tooltip = old
           return this
         }
        
        }(window.jQuery);
        
        
        
        /* ===========================================================
        * bootstrap-popover.js v2.3.2
        * http://twitter.github.com/bootstrap/javascript.html#popovers
        * ===========================================================
        * Copyright 2012 Twitter, Inc.
        *
        * Licensed under the Apache License, Version 2.0 (the "License");
        * you may not use this file except in compliance with the License.
        * You may obtain a copy of the License at
        *
        * http://www.apache.org/licenses/LICENSE-2.0
        *
        * Unless required by applicable law or agreed to in writing, software
        * distributed under the License is distributed on an "AS IS" BASIS,
        * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        * See the License for the specific language governing permissions and
        * limitations under the License.
        * =========================================================== */
        
        
        !function ($) {
        
         "use strict"; // jshint ;_;
        
        
        /* POPOVER PUBLIC CLASS DEFINITION
         * =============================== */
        
         var Popover = function (element, options) {
           this.init('popover', element, options)
         }
        
        
         /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
            ========================================== */
        
         Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
        
           constructor: Popover
        
         , setContent: function () {
             var $tip = this.tip()
               , title = this.getTitle()
               , content = this.getContent()
        
             $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
             $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)
        
             $tip.removeClass('fade top bottom left right in')
           }
        
         , hasContent: function () {
             return this.getTitle() || this.getContent()
           }
        
         , getContent: function () {
             var content
               , $e = this.$element
               , o = this.options
        
             content = (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)
               || $e.attr('data-content')
        
             return content
           }
        
         , tip: function () {
             if (!this.$tip) {
               this.$tip = $(this.options.template)
             }
             return this.$tip
           }
        
         , destroy: function () {
             this.hide().$element.off('.' + this.type).removeData(this.type)
           }
        
         })
        
        
        /* POPOVER PLUGIN DEFINITION
         * ======================= */
        
         var old = $.fn.popover
        
         $.fn.popover = function (option) {
           return this.each(function () {
             var $this = $(this)
               , data = $this.data('popover')
               , options = typeof option == 'object' && option
             if (!data) $this.data('popover', (data = new Popover(this, options)))
             if (typeof option == 'string') data[option]()
           })
         }
        
         $.fn.popover.Constructor = Popover
        
         $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
           placement: 'right'
         , trigger: 'click'
         , content: ''
         , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
         })
        
        
        /* POPOVER NO CONFLICT
         * =================== */
        
         $.fn.popover.noConflict = function () {
           $.fn.popover = old
           return this
         }
        
        }(window.jQuery);
        
        
                </script>
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script> -->
    <!-- <script src="https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script> -->
    <!-- <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.no-icons.min.css"> -->
    <!-- <LibLoader url="https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js" on:loaded= {activateInfoButton}></LibLoader> -->
    <title>My Events</title>
</svelte:head>


<!-- Start Payout Modal -->
<div id="modal-payout" class="modal">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-xs-12 c-text">
                <h2>Withdraw Confirmation</h2>

                <div class="modal-content form-main">
                    
                    <!-- <h3>Current Balance<a class="info" data-toggle="popover" data-placement="right" data-content={`Some card payments are available after some pending period.`} title={`Pending : $${price_number(pending, true)}`} data-original-title={`Pending : $${price_number(pending, true)}`}>Info</a></h3> -->
                    <h3>Current Balance
                      <a class="info" 
                        on:click={e => {alert(`Some card payments are available after some pending period.`)}} 
                        title={typeof pending == "number" ? `Pending : $${price_number(pending)}` : 'Pending : summing up...'}
                      >Info</a>
                    </h3>
                    
                    {#if typeof balance == "number"}
                        <h4>$<span> {price_number(balance, true)}</span></h4>
                    {:else}
                        <h4>{balance}</h4>
                    {/if}
                    
                    <div class="mt-40"></div>
                
                    <label>Withdraw Amount</label>
                    <input type="number" disabled={balance<=0} bind:value={withdrawAmount}/>

                    <div class="mt-40"></div>
                    <a class="main-btn-2" href="#" rel="modal:close">Cancel</a>
                    {#if withdrawAmount <= 0}
                    <a class="main-btn" href="#" rel="modal:open" class:disable={true}>Withdraw</a>
                    {:else}
                    <a class="main-btn" href="#modal-payout-confirm" rel="modal:open" class:disable={false}>Withdraw</a>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
<!-- End Payout Modal -->

<!-- Start Payout Confirm  Modal -->
<div id="modal-payout-confirm" class="modal">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-xs-12 c-text">
                <div class="modal-content form-main">
                    <p>Any balance that is withdrawn will not be able to be refunded through our platform. Please ensure that you have a sufficient balance to refund attendees if needed otherwise you will have to manually refund outside of our platform.</p>
                    <div class="mt-40"></div>
                    <a class="main-btn-2" href="#" rel="modal:close">Cancel</a>
                    <a class="main-btn" href="#" rel="modal:close" on:click={withdraw}>Agree</a>

                </div>
            </div>
        </div>
    </div>
</div>
<!-- End Payout Confirm Modal -->

<Header event={event}/>
<NavBar event={event}/>

<div class="container-fluid">
    <h4>Summary</h4>
    <div class="mt-20"></div>
    <div class="row" style="margin-left:-8px;">

        <!-- Start Card -->
        <div class="col-md-4 col-xs-12">
            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-12">
                        <h3>Total Online Ticket Sales</h3>
                    </div>
                </div>

                <!-- Total -->
                <div class="total-c">
                  {#if typeof eventSales == "number"}
                    <h2>$ {price_number(eventSales)}</h2>
                  {:else}
                    <h2> Summing up...</h2>
                  {/if}
                </div>
            </div>
        </div>

        <!-- Start Card -->
        <div class="col-md-4 col-xs-12">
            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-12">
                        <h3>Fee</h3>
                    </div>
                </div>

                <!-- Total -->
                <div class="total-c">
                  {#if typeof eventSales == "number"}
                    <h2>$ {price_number(eventFee)}</h2>
                  {:else}
                    <h2> Summing up...</h2>
                  {/if}
                </div>
            </div>
        </div>

        <!-- Start Card -->
        <div class="col-md-4 col-xs-12">
            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-12">
                        <h3>Total Revenue</h3>
                    </div>
                </div>

                <!-- Total -->
                <div class="total-c">
                  {#if typeof eventSales == "number"}
                    <h2>$ {price_number(eventRevenue)}</h2>
                  {:else}
                    <h2> Summing up...</h2>
                  {/if}
                </div>
            </div>
        </div>

        <div class="col-md-12 col-xs-12">
            <!-- {#if false && event.status != 'past'} -->
            <!-- {#if price_number(eventRevenue) != 0} -->
                <div class="alert">
                    <p>Your income can be withdrawn when the event is over.</p>
                </div>
                <br>
                <div class="mt-30"></div>
                <a class="main-btn" href="#modal-payout" rel="modal:open">Withdraw</a>
                <!-- <a class="main-btn disable">Withdraw</a> -->
            <!-- {:else}
                <div class="mt-30"></div>
                <a class="main-btn" href="#modal-payout" rel="modal:open">Withdraw</a>
            {/if} -->
        </div>


    </div>
</div>

<style>
    .main-btn.disable
    {
        background: #919191;
        border: none;
        color: #5c5c5c;
        cursor: not-allowed;
    }

    .container-fluid {
        padding-left: 265px;
        margin-top: 90px;
    }
    @media screen and (max-width: 768px) {
        .container-fluid {
            padding-right: 1rem;
            padding-left: 1rem;
        }
    }

    a.info {
        vertical-align: bottom;
        position:relative; /* Anything but static */
        width: 1.5em;
        height: 1.5em;
        text-indent: -9999em;
        display: inline-block;
        color: white;
        font-weight:bold;
        font-size:1em;
        line-height:1em;
        background-color: #91b2d2;
        margin-left: .25em;
        -webkit-border-radius:.75em;
        -moz-border-radius:.75em;
        border-radius:.75em;
    }
    a.info:hover {
    background-color:#628cb6;
    cursor: hand; 
    cursor: pointer;
    }
    a.info:before {
    content:"?";
    position: absolute;
    top: .25em;
    left:0;
    text-indent: 0;
    display:block;
    width:1.5em;
    text-align:center;
    }

    .popover-title {
    font-weight:bold;
    }


    label a.info, 
    label div.popover.fade.in { 
    opacity: 0;
    -webkit-transition: opacity 0.2s ease;
    -moz-transition: opacity 0.2s ease;
    transition: opacity 0.2s ease;
    }
    label:hover a.info, 
    label:hover div.popover.fade.in { 
    opacity: 1; }
</style>