/** Platform identifiers for bundled command decks */
export type PlatformId =
  | "claude"
  | "chatgpt"
  | "cursor"
  | "gemini"
  | "lovable"
  | "perplexity"
  | "copilot"
  | "mistral"
  | "deepseek"
  | "grok";

export type Command = {
  id: string;
  platform: PlatformId;
  name: string;
  short: string;
  detail: string;
  category: string;
  /** Higher = more likely in "featured" pool */
  weight?: number;
};
