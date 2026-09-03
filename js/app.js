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

  $(document).on("click", ".cc-nav-toggle", function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    $("#main-nav").collapse("toggle");
  });

  $(document).on("click", ".cc-nav-close, .cc-nav-overlay", function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    $("#main-nav").collapse("hide");
  });

  $(document).on("shown.bs.collapse", "#main-nav", function () {
    $(".cc-nav-toggle").removeClass("collapsed").attr("aria-expanded", "true");
  });

  $(document).on("hidden.bs.collapse", "#main-nav", function () {
    $(".cc-nav-toggle").addClass("collapsed").attr("aria-expanded", "false");
    this.style.removeProperty("--cc-drawer-offset");
    $(this).removeClass("cc-nav-dragging");
  });

  var touchStartY = null;
  var touchCurrentY = null;
  $(document).on("touchstart", "#main-nav", function (event) {
    if (!$(this).hasClass("in")) return;
    touchStartY = event.originalEvent.touches[0].clientY;
    touchCurrentY = touchStartY;
  });

  $(document).on("touchmove", "#main-nav", function (event) {
    if (touchStartY === null) return;
    touchCurrentY = event.originalEvent.touches[0].clientY;
    var distance = touchCurrentY - touchStartY;
    if (distance > 0 && this.scrollTop === 0) {
      event.preventDefault();
      this.style.setProperty("--cc-drawer-offset", distance + "px");
      $(this).addClass("cc-nav-dragging");
    }
  });

  $(document).on("touchend touchcancel", "#main-nav", function () {
    if (touchStartY === null) return;
    var distance = touchCurrentY - touchStartY;
    if (distance > 80) {
      $(this).collapse("hide");
    } else {
      this.style.removeProperty("--cc-drawer-offset");
      $(this).removeClass("cc-nav-dragging");
    }
    touchStartY = null;
    touchCurrentY = null;
  });
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
var acc = document.getElementsByClassName("contentBx");
var i;
var len = acc.length;
for (i = 0; i < len; i++) {
  acc[i].addEventListener("click", function () {
    this.classList.toggle("active");
  });
}
