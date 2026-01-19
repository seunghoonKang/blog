const currentTheme = localStorage.getItem("theme");
let themeValue =
  currentTheme ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

function setTheme() {
  document.documentElement.setAttribute("data-theme", themeValue);
  localStorage.setItem("theme", themeValue);
}

setTheme(); // 즉시 실행

window.onload = () => {
  document.querySelector("#toggle-theme")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setTheme();
  });
};
