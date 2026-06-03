function formatPaddedMonthDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}월 ${day}일`;
}

export function formatStoryDate(
  pubDate: Date,
  options?: { omitYear?: boolean }
): string {
  const date = new Date(pubDate);
  const currentYear = new Date().getFullYear();

  if (options?.omitYear || date.getFullYear() === currentYear) {
    return formatPaddedMonthDay(date);
  }

  return `${date.getFullYear()}년 ${formatPaddedMonthDay(date)}`;
}

export function formatArticleDate(pubDate: Date): string {
  return new Date(pubDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
