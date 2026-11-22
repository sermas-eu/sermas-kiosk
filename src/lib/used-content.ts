import { SvelteMap } from "svelte/reactivity";

type ContentRef = { requestId?: string; chunkId?: string; messageId?: string };

/**
 * Buttons and quiz blocks already answered, with the index chosen. The API drops a
 * block's tools after its first click (single use), so a used block must not be
 * clickable again: buttons blocks are hidden, a quiz shows only the chosen answer.
 * Keyed by the content's ids, not the object: the chat history is a structuredClone
 * rebuilt on every message.
 */
export const usedContent = new SvelteMap<string, number>();

export const contentKey = (ref?: ContentRef | null): string | undefined => {
  if (!ref) return undefined;
  const id = ref.requestId || ref.messageId;
  return id && ref.chunkId ? `${id}:${ref.chunkId}` : undefined;
};

export const markUsed = (key: string | undefined, index: number) => {
  if (key && !usedContent.has(key)) usedContent.set(key, index);
};

export const isUsed = (key: string | undefined): boolean =>
  !!key && usedContent.has(key);

export const usedIndex = (key: string | undefined): number =>
  (key ? usedContent.get(key) : undefined) ?? -1;
