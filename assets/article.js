const article = document.querySelector("[data-bilingual-article]");

if (article) {
  const controls = article.querySelector(".reading-controls");
  const buttons = [...controls.querySelectorAll("[data-reading]")];
  const allowedModes = new Set(buttons.map((button) => button.dataset.reading));

  function setReadingMode(mode) {
    const selected = allowedModes.has(mode) ? mode : "all";
    article.dataset.readingMode = selected;
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.reading === selected));
    }
    for (const translation of article.querySelectorAll(".article-language")) {
      translation.hidden = selected !== "all" && translation.lang !== selected;
    }
  }

  function readLocation() {
    setReadingMode(new URL(window.location.href).searchParams.get("lang"));
  }

  controls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading]");
    if (!button) return;
    setReadingMode(button.dataset.reading);
    const url = new URL(window.location.href);
    if (button.dataset.reading === "all") url.searchParams.delete("lang");
    else url.searchParams.set("lang", button.dataset.reading);
    window.history.replaceState(null, "", url);
  });

  readLocation();
  window.addEventListener("popstate", readLocation);
  controls.hidden = false;
}
