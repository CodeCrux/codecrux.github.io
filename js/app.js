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

  $(".blog-post-body .highlight, .blog-post-body > pre").each(function () {
    var block = this;
    if (block.querySelector(".cc-code-copy")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "cc-code-copy";
    button.setAttribute("aria-label", "Copy code");
    button.setAttribute("title", "Copy code");
    button.innerHTML = '<i class="fa fa-copy" aria-hidden="true"></i><span>Copy</span>';

    button.addEventListener("click", function () {
      var source = block.querySelector(".rouge-code pre") || block.querySelector("code") || block.querySelector("pre");
      if (!source) return;

      var text = source.innerText || source.textContent;
      var copy = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(text)
        : new Promise(function (resolve, reject) {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            try {
              document.execCommand("copy") ? resolve() : reject();
            } catch (error) {
              reject(error);
            }
            document.body.removeChild(textarea);
          });

      copy.then(function () {
        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Code copied");
        button.setAttribute("title", "Code copied");
        button.querySelector("span").textContent = "Copied";
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          button.setAttribute("aria-label", "Copy code");
          button.setAttribute("title", "Copy code");
          button.querySelector("span").textContent = "Copy";
        }, 1800);
      });
    });

    block.appendChild(button);
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
