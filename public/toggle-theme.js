const currentTheme = localStorage.getItem("theme");
let themeValue =
  currentTheme ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

function getGiscusTheme() {
  return themeValue === "dark" ? "dark" : "light";
}

function notifyGiscusTheme() {
  const iframe = document.querySelector("iframe.giscus-frame");
  if (!iframe) return;
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme: getGiscusTheme() } } },
    "https://giscus.app",
  );
}

function setTheme() {
  document.documentElement.setAttribute("data-theme", themeValue);
  localStorage.setItem("theme", themeValue);
  notifyGiscusTheme();
}

setTheme(); // 즉시 실행

window.onload = () => {
  document.querySelector("#toggle-theme")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setTheme();
  });
};
