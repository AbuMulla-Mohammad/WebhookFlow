export const ACTION_TYPES = [
  "summarize-youtube-video",
  "transform-json",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
