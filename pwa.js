(function () {
  "use strict";

  var root = document.documentElement;

  function setThemeColor() {
    var bg = getComputedStyle(root).getPropertyValue("--bg").trim() || "#f5efe4";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", bg);
  }

  function setMobileInsets() {
    var vv = window.visualViewport;
    var bottomInset = 0;

    if (vv) {
      bottomInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    }

    root.style.setProperty("--app-bottom-inset", Math.ceil(bottomInset) + "px");
    root.style.setProperty("--app-viewport-height", (vv ? vv.height : window.innerHeight) + "px");
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        // The app still works as a regular static page when service workers are blocked.
      });
    });
  }

  setThemeColor();
  setMobileInsets();
  registerServiceWorker();

  window.addEventListener("resize", setMobileInsets);
  window.addEventListener("orientationchange", setMobileInsets);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setMobileInsets);
    window.visualViewport.addEventListener("scroll", setMobileInsets);
  }
  window.addEventListener("tweakchange", setThemeColor);
})();
