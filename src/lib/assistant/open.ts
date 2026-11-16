/**
 * Lets any page open the floating Charm panel: a support centre button, a
 * "continue this conversation" link or a suggested question. The panel
 * (CharmWidget) is the only listener.
 */
export type OpenCharmRequest = {
  /** Open this conversation instead of the current one. */
  threadId?: string | undefined;
  /** Start a fresh conversation first. */
  fresh?: boolean | undefined;
  /** Send this as the person's first message once the chat is open. */
  prompt?: string | undefined;
  /** Go straight to the human handover. */
  human?: boolean | undefined;
};

export const OPEN_CHARM_EVENT = "enski:charm-open";

export function openCharm(request: OpenCharmRequest = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<OpenCharmRequest>(OPEN_CHARM_EVENT, { detail: request }));
}
