export function smoothScroll() {
  document.querySelectorAll(".toc-link")?.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href")?.slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      const offset = 96;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      history.pushState(null, "", `#${targetId}`);
    });
  });
}
