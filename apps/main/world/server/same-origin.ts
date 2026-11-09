export function sameOrigin(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin
}
