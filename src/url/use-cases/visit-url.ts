import { browser } from "@wxt-dev/browser";

export function visitURL(url: string) {
  browser.tabs.update({ url });
}
