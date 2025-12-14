export type BotConfig = {
  id: string;
  name: string;
  model: string;

  knowledgeText?: string;
  knowledgeUrl?: string;

  systemInstruction?: string; // Adjust Bot Response
  createdAt: number;
};
