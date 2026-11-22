/**
 * Keeps a scrolling panel at its newest content: on added content, and when an
 * image or video inside finishes loading (it grows the panel after the first
 * scroll). Stops while the user has scrolled up, resumes at the bottom.
 */
export function stickToBottom(node: HTMLElement) {
  let stick = true;
  const toBottom = () => {
    if (stick) node.scrollTop = node.scrollHeight;
  };
  const onScroll = () => {
    stick = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
  };
  const changes = new MutationObserver(toBottom);

  node.addEventListener("scroll", onScroll, { passive: true });
  // load does not bubble: listen in the capture phase
  node.addEventListener("load", toBottom, true);
  changes.observe(node, { childList: true, subtree: true });
  toBottom();

  return {
    destroy() {
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("load", toBottom, true);
      changes.disconnect();
    },
  };
}
