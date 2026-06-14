export function loginPath(redirect = "/") {
  return `/giris?redirect=${encodeURIComponent(redirect)}`;
}
