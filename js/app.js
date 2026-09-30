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

  var touchStartX = null;
  var touchCurrentX = null;
  $(document).on("touchstart", "#main-nav", function (event) {
    if (!$(this).hasClass("in")) return;
    touchStartX = event.originalEvent.touches[0].clientX;
    touchCurrentX = touchStartX;
  });

  $(document).on("touchmove", "#main-nav", function (event) {
    if (touchStartX === null) return;
    touchCurrentX = event.originalEvent.touches[0].clientX;
    var distance = touchStartX - touchCurrentX;
    if (distance > 0) {
      event.preventDefault();
      this.style.setProperty("--cc-drawer-offset", -distance + "px");
      $(this).addClass("cc-nav-dragging");
    }
  });

  $(document).on("touchend touchcancel", "#main-nav", function () {
    if (touchStartX === null) return;
    var distance = touchStartX - touchCurrentX;
    if (distance > 80) {
      $(this).collapse("hide");
    } else {
      this.style.removeProperty("--cc-drawer-offset");
      $(this).removeClass("cc-nav-dragging");
    }
    touchStartX = null;
    touchCurrentX = null;
  });

  var axecPopupKey = "ccAxecCtaClosedAt";
  var axecPopupSessionKey = "ccAxecCtaSeen";
  var axecPopupDelay = 3000;
  var axecPopupWindow = 3 * 24 * 60 * 60 * 1000;

  $("body").append('<div class="cc-axec-popup" role="dialog" aria-modal="true" aria-labelledby="cc-axec-popup-title" aria-hidden="true"><div class="cc-axec-popup-card"><button type="button" class="cc-axec-popup-close" aria-label="Close promotion"><span aria-hidden="true">&times;</span></button><p class="cc-kicker">AXEC / enterprise AI security</p><h2 id="cc-axec-popup-title">Start your first secured agent workflow.</h2><p>Put one valuable agent action behind identity, policy, protected credentials, approvals, and evidence.</p><a href="https://cal.id/axec/demo?duration=30" class="cc-button cc-button-primary" target="_blank" rel="noopener">Schedule a 30-minute conversation <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a></div></div>');

  var axecPopup = document.querySelector(".cc-axec-popup");
  var closeAxecPopup = function () {
    axecPopup.classList.remove("is-visible");
    axecPopup.setAttribute("aria-hidden", "true");
    try {
      sessionStorage.setItem(axecPopupSessionKey, "1");
      localStorage.setItem(axecPopupKey, String(Date.now()));
    } catch (error) {}
  };
  var showAxecPopup = function () {
    axecPopup.classList.add("is-visible");
    axecPopup.setAttribute("aria-hidden", "false");
    try { sessionStorage.setItem(axecPopupSessionKey, "1"); } catch (error) {}
  };

  axecPopup.addEventListener("click", function (event) {
    if (event.target === axecPopup || event.target.closest(".cc-axec-popup-close")) closeAxecPopup();
  });
  axecPopup.querySelector(".cc-button").addEventListener("click", closeAxecPopup);

  window.setTimeout(function () {
    var seenThisSession = false;
    var lastClosedAt = 0;
    try {
      seenThisSession = sessionStorage.getItem(axecPopupSessionKey) === "1";
      lastClosedAt = Number(localStorage.getItem(axecPopupKey)) || 0;
    } catch (error) {}
    if (!seenThisSession || Date.now() - lastClosedAt >= axecPopupWindow) showAxecPopup();
  }, axecPopupDelay);

  $(".blog-post-body .highlight:not(pre), .blog-post-body > pre").each(function () {
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
