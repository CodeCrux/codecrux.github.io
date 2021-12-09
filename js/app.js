$(document).ready(function () {
  var navbar = $("#navbar");
  handleStickyNav($(window));
  $(window).scroll(function () {
    handleStickyNav(this);
  });
  function handleStickyNav(element) {
    if ($(element).scrollTop() > 100) {
      navbar.addClass("sticky");
    } else {
      navbar.removeClass("sticky");
    }
  }
});

var acc = document.getElementsByClassName("accordion");
var i;
var len = acc.length;
for (i = 0; i < len; i++) {
  acc[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}
