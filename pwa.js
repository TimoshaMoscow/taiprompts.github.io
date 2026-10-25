(() => {
  const installSelector = "[data-pwa-install]";
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let deferredInstallPrompt = null;
  let hintTimer;

  const installHint = document.createElement("div");
  installHint.className = "pwa-install-hint";
  installHint.hidden = true;
  installHint.setAttribute("role", "status");
  installHint.setAttribute("aria-live", "polite");
  installHint.textContent = "В Safari нажмите «Поделиться», затем «На экран Домой», чтобы установить TAIPrompts.";
  document.body.append(installHint);

  function updateInstallUI() {
    const installed = isStandalone();
    document.querySelectorAll(installSelector).forEach((button) => {
      button.hidden = installed || (!deferredInstallPrompt && !isIOS);
      const navItem = button.closest(".pwa-install-link");
      if (navItem) navItem.hidden = button.hidden;
    });
  }

  document.addEventListener("click", async (event) => {
    const button = event.target instanceof Element ? event.target.closest(installSelector) : null;
    if (!button) return;
    if (!deferredInstallPrompt) {
      if (isIOS) {
        installHint.hidden = false;
        clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => { installHint.hidden = true; }, 6000);
      }
      return;
    }

    button.disabled = true;
    try {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      updateInstallUI();
    } catch (error) {
      console.warn("Не удалось открыть установку приложения:", error);
    } finally {
      button.disabled = false;
    }
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUI();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallUI();
  });
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", updateInstallUI);

  updateInstallUI();
  if (document.body) new MutationObserver(updateInstallUI).observe(document.body, { childList: true, subtree: true });

  // Remove the obsolete offline worker and its one-page fallback cache from earlier versions.
  if ("serviceWorker" in navigator) {
    const siteRoot = new URL("./", window.location.href).pathname;
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      const obsolete = registrations.filter((registration) => {
        const scopePath = new URL(registration.scope).pathname;
        const worker = registration.active || registration.waiting || registration.installing;
        const scriptPath = worker ? new URL(worker.scriptURL).pathname : "";
        return scopePath.startsWith(siteRoot) && scriptPath.endsWith("/service-worker.js");
      });
      await Promise.all(obsolete.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.filter((name) => name.startsWith("taiprompts-offline-")).map((name) => caches.delete(name)));
      }
    }).catch((error) => console.warn("Не удалось удалить прежний офлайн-режим:", error));
  }
})();
