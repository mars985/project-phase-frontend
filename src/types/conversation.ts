import type { Prompt } from "./prompt";

export type Conversation = {
  _id: string;
  prompts: Prompt[]; // populated prompts
}
