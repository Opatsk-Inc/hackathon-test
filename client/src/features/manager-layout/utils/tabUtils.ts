export function getCurrentTabValue(pathname: string): string {
  if (pathname === "/manager" || pathname === "/manager/resources") {
    return "/manager"
  }
  return pathname
}
