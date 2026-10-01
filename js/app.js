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

  var securityPopupKey = "ccSecurityCtaClosedAt";
  var securityPopupSessionKey = "ccSecurityCtaSeen";
  var securityPopupDelay = 3000;
  var securityPopupWindow = 3 * 24 * 60 * 60 * 1000;

  $("body").append('<div class="cc-security-popup" role="dialog" aria-modal="true" aria-labelledby="cc-security-popup-title" aria-hidden="true"><div class="cc-security-popup-card"><button type="button" class="cc-security-popup-close" aria-label="Close promotion"><span aria-hidden="true">&times;</span></button><p class="cc-kicker">CodeCrux / enterprise AI security</p><h2 id="cc-security-popup-title">Ready to secure an AI workflow?</h2><p>CodeCrux helps teams put identity, policy, approvals, protected access, and evidence around production agent actions.</p><a href="/contact/" class="cc-button cc-button-primary">Talk to CodeCrux <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a></div></div>');

  var securityPopup = document.querySelector(".cc-security-popup");
  var closeSecurityPopup = function () {
    securityPopup.classList.remove("is-visible");
    securityPopup.setAttribute("aria-hidden", "true");
    try {
      sessionStorage.setItem(securityPopupSessionKey, "1");
      localStorage.setItem(securityPopupKey, String(Date.now()));
    } catch (error) {}
  };
  var showSecurityPopup = function () {
    securityPopup.classList.add("is-visible");
    securityPopup.setAttribute("aria-hidden", "false");
    try { sessionStorage.setItem(securityPopupSessionKey, "1"); } catch (error) {}
  };

  securityPopup.addEventListener("click", function (event) {
    if (event.target === securityPopup || event.target.closest(".cc-security-popup-close")) closeSecurityPopup();
  });
  securityPopup.querySelector(".cc-button").addEventListener("click", closeSecurityPopup);

  window.setTimeout(function () {
    var seenThisSession = false;
    var lastClosedAt = 0;
    try {
      seenThisSession = sessionStorage.getItem(securityPopupSessionKey) === "1";
      lastClosedAt = Number(localStorage.getItem(securityPopupKey)) || 0;
    } catch (error) {}
    if (!seenThisSession && Date.now() - lastClosedAt >= securityPopupWindow) showSecurityPopup();
  }, securityPopupDelay);

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
