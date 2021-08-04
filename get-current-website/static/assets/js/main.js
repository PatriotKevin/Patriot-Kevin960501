


//select place order
$(".custom-select").each(function () {
    var classes = $(this).attr("class"),
        id = $(this).attr("id"),
        name = $(this).attr("name");
    var template = '<div class="' + classes + '">';
    template +=
        '<span class="custom-select-trigger">' +
        $(this).attr("placeholder") +
        "</span>";
    template += '<div class="custom-options">';
    $(this)
        .find("option")
        .each(function () {
            template +=
                '<span class="custom-option ' +
                $(this).attr("class") +
                '" data-value="' +
                $(this).attr("value") +
                '">' +
                $(this).html() +
                "</span>";
        });
    template += "</div></div>";

    $(this).wrap('<div class="custom-select-wrapper"></div>');
    $(this).hide();
    $(this).after(template);
});
$(".custom-option:first-of-type").hover(
    function () {
        $(this)
            .parents(".custom-options")
            .addClass("option-hover");
    },
    function () {
        $(this)
            .parents(".custom-options")
            .removeClass("option-hover");
    }
);
$(".custom-select-trigger").on("click", function () {
    $("html").one("click", function () {
        $(".custom-select").removeClass("opened");
    });
    $(this)
        .parents(".custom-select")
        .toggleClass("opened");
    event.stopPropagation();
});
$(".custom-option").on("click", function () {
    $(this)
        .parents(".custom-select-wrapper")
        .find("select")
        .val($(this).data("value"));
    $(this)
        .parents(".custom-options")
        .find(".custom-option")
        .removeClass("selection");
    $(this).addClass("selection");
    $(this)
        .parents(".custom-select")
        .removeClass("opened");
    $(this)
        .parents(".custom-select")
        .find(".custom-select-trigger")
        .text($(this).text());
});




//quantity (placeorder)
jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
jQuery('.quantity').each(function () {
    var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        btnUp = spinner.find('.quantity-up'),
        btnDown = spinner.find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

    btnUp.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

    btnDown.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

});



//dropdown 
$(document).ready(function () {

    $(".account-btn").click(function () {

        $("#account-panel").slideToggle();

    });

    $(window).click(function () {

        $("#account-panel").hide();

        $("#account-panel, .account-btn").click(function (event) {
            event.stopPropagation();
        });

    });

});



//add event

$('.event-calendar').equinox({
    events: [

      {
      start: '2021-01-20 17:30',
      end: '2021-01-20 17:35',
      title: 'INDIE FEST 2021',
      url: '#',
      class: '',
      color: '#000',
      data: {}
    },

    {
        start: '2021-01-20 17:30',
        end: '2021-01-20 17:35',
        title: 'INDIE FEST 2021',
        url: '#',
        class: '',
        color: '#000',
        data: {}
      },
 

    {
      start: '2021-01-20 17:30',
      end: '2021-01-21 17:30',
      title: 'We Love Green',
      url: '#',
      class: '',
      color: 'red',
      data: {}
    },
    
    {
        start: '2021-02-20 17:30',
        end: '2021-02-25 17:30',
        title: 'Piano Concert',
        url: '#',
        class: '',
        color: 'red',
        data: {}
      }  
  
  ],

  onEventClick:true,
   
  });