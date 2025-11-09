export type ChatPeer = {
  type: 'vendor' | 'support';
  id?: string;
  name?: string;
  avatar?: string;
};

const EVENT_NAME = 'ros:chat-open';

export function openChatWithPeer(peer: ChatPeer) {
  try {
    const evt = new CustomEvent(EVENT_NAME, { detail: { peer } });
    window.dispatchEvent(evt);
  } catch (e) {
    // noop
  }
}

export function openChatWithVendor(vendor: { id: string; name: string; image?: string }) {
  openChatWithPeer({ type: 'vendor', id: String(vendor.id), name: vendor.name, avatar: vendor.image });
}

export const CHAT_EVENTS = {
  EVENT_NAME,
};

