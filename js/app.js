$(document).ready(function(){
	var navbar = $("#navbar");
	handleStickyNav($(window));
	$(window).scroll(function() {
	  handleStickyNav(this);
	});
	function handleStickyNav(element) {
		if( $(element).scrollTop() > 100 ) {
	    navbar.addClass('sticky');
	  } else {
	    navbar.removeClass('sticky');
	  }
	}
});