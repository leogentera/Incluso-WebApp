
	$(".accsub").click(function(){
		$(this).toggleClass('icon-arrow');
		$(this).toggleClass('icon-arrow-up');
		$(this).toggleClass('green');
		$(this).toggleClass('white');
		var cual = $(this).attr('data-id');
		  $('#sub' + cual).toggle();

	});
    $('#menuton').click(function() {
      var transitionClass = $(this).data('transition');
      $('body').removeClass();
      $('#site-canvas').removeClass();
      $('#site-canvas').addClass(transitionClass);
      $('#site-wrapper').toggleClass('show-nav');

      return false;
    });
	$('#closeaton').click(function() {
      var transitionClass = $(this).data('transition');
      $('body').removeClass();
      $('#site-canvas').removeClass();
      $('#site-canvas').addClass(transitionClass);
      $('#site-wrapper').toggleClass('show-nav');

      return false;
    });