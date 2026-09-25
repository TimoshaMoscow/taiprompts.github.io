(() => {
  const installSelector = "[data-pwa-install]";
  const status = document.getElementById("pwaStatus");
  const iosHelp = document.getElementById("pwa-ios-help");
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let deferredInstallPrompt = null;
  let toastTimer;
  let offlineFallbackReady = false;

  const toast = document.createElement("div");
  toast.className = "pwa-connectivity-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.append(toast);

  function showToast(message, state) {
    toast.textContent = message;
    toast.dataset.state = state;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  function updateInstallUI() {
    const installed = isStandalone();
    document.querySelectorAll(installSelector).forEach((button) => {
      button.hidden = installed || (!deferredInstallPrompt && !isIOS);
      button.setAttribute("aria-label", installed ? "Приложение уже установлено" : "Установить TAIPrompts");
      const navItem = button.closest(".pwa-install-link");
      if (navItem) navItem.hidden = button.hidden;
    });
    if (iosHelp) iosHelp.hidden = !isIOS || installed;
  }

  function updateNetworkUI(showMessage = false) {
    const online = navigator.onLine;
    if (status) {
      status.dataset.network = online ? "online" : "offline";
      status.textContent = online
        ? (offlineFallbackReady ? "Вы в сети. Офлайн-заглушка подготовлена на случай потери соединения." : "Вы в сети. Подключаем офлайн-заглушку…")
        : (offlineFallbackReady ? "Нет соединения. При переходе на страницу откроется офлайн-заглушка." : "Нет соединения. Офлайн-заглушка ещё не была загружена при подключении к сети.");
    }
    if (showMessage) showToast(online ? "Соединение восстановлено." : (offlineFallbackReady ? "Нет соединения. При переходе откроется офлайн-заглушка." : "Нет соединения."), online ? "online" : "offline");
  }

  document.addEventListener("click", async (event) => {
    const button = event.target instanceof Element ? event.target.closest(installSelector) : null;
    if (!button) return;

    if (!deferredInstallPrompt) {
      if (isIOS) showToast("В Safari нажмите «Поделиться», затем «На экран Домой».", "online");
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
    showToast("TAIPrompts установлено на устройство.", "online");
  });
  window.addEventListener("online", () => updateNetworkUI(true));
  window.addEventListener("offline", () => updateNetworkUI(true));
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", updateInstallUI);

  updateInstallUI();
  updateNetworkUI();

  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker
      .register("./service-worker.js", { scope: "./", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        offlineFallbackReady = true;
        if (status) status.dataset.worker = "ready";
        updateNetworkUI();
      })
      .catch((error) => {
        console.warn("Не удалось подключить PWA-офлайн-заглушку:", error);
        if (status) status.dataset.worker = "unavailable";
      });
  } else if (status) {
    status.dataset.worker = "unavailable";
  }

  if (document.body) {
    new MutationObserver(updateInstallUI).observe(document.body, { childList: true, subtree: true });
  }
})();
