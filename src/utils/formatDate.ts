export function formatArticleDate(pubDate: Date): string {
  return new Date(pubDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
