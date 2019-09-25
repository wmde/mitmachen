$(document).ready(function() {
	$(".SlickCarousel").slick({
		rtl: false, // If RTL Make it true & .slick-slide{float:right;}
		autoplay: true,
		autoplaySpeed: 5000, //  Slide Delay
		speed: 800, // Transition Speed
		slidesToShow: 5, // Number Of Carousel
		slidesToScroll: 1, // Slide To Move 
		pauseOnHover: false,
		appendArrows: $(".Carousel-slider-block .SlickCarousel"), // Class For Arrows Buttons
		prevArrow: '<span class="Slick-Prev"></span>',
		nextArrow: '<span class="Slick-Next"></span>',
		easing: "linear",
		responsive: [{
				breakpoint: 991,
				settings: {
					slidesToShow: 3,
				}
			},
			{
				breakpoint: 767,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 575,
				settings: {
					slidesToShow: 1,
				}
			},
		],
	})

	$('[data-toggle="tooltip"]').tooltip();

	$(".custom-select-box").click(function() {
		$(this).parent().find(".select-subitems").slideToggle();
	});


	// clear input on click
	$('.clear-all').on('click', function(){
		$('#category').val('');
	})

});




$(window).load(function() {
	// $('#myModal').modal('show');
});