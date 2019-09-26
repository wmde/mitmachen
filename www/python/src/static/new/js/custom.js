

$(document).ready(function(){
  /*var owl = $('.owl-carousel');
              owl.owlCarousel({
                stagePadding: 130,
                margin: 10,
                nav: true,
                loop: false,
                navRewind:false,
                responsive: {
                  0: {
                    items: 1,
                    stagePadding: 50,
                  },
                  600: {
                    items: 2
                  },
                  1000: {
                    items: 5
                  }
                }
              });*/

  $('[data-toggle="tooltip"]').tooltip(); 

  $(".custom-select-box").click(function(){
  	$(this).parent().find(".select-subitems").slideToggle();
  });

  // clear input on click
  $('.clear-all').on('click', function(){
    $('#category').val('');
  })
              

});   


  

 /*$(window).load(function(){        
   $('#myModal').modal('show');
 }); */
 
 $("button.navbar-toggler").click(function(){
  $("button.navbar-toggler").toggleClass("icon-rotate");
  $(".buttons-wrap").slideToggle();
});



 







