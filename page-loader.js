(() => {
  const loader = document.querySelector(".site-loader");
  if (!loader) return;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    loader.classList.add("is-leaving");
    window.setTimeout(() => loader.remove(), 420);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
  window.setTimeout(finish, 8000);
})();
