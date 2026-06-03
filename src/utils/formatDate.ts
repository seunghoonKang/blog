export function formatStoryDate(pubDate: Date): string {
  const date = new Date(pubDate);
  const currentYear = new Date().getFullYear();

  if (date.getFullYear() === currentYear) {
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatArticleDate(pubDate: Date): string {
  return new Date(pubDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
