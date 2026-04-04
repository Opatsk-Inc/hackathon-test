export function formatDate(date: string | Date): string {
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString("uk-UA")
  }
  return date.toLocaleDateString("uk-UA")
}

export function formatDateTime(date: string | Date): string {
  if (typeof date === "string") {
    return new Date(date).toLocaleString("uk-UA")
  }
  return date.toLocaleString("uk-UA")
}
