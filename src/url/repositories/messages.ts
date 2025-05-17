import { browser } from "@wxt-dev/browser";
type URL_LOADED_MESSAGE = {
  type: "URL_LOADED";
  url: string;
};

export type Messages = URL_LOADED_MESSAGE;

export function createMessenger(
  sendMessage: typeof browser.runtime.sendMessage,
) {
  return {
    sendUrl: async (url: string) => {
      const message: URL_LOADED_MESSAGE = { type: "URL_LOADED", url };
      await sendMessage(undefined, message);
    },
  };
}
