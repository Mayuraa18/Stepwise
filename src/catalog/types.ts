import type { Difficulty } from "../engine/types.ts";

export type CatalogExample = {
  input: string;
  output: string;
  explanation: string;
};

export type CatalogProblem = {
  id: string;
  visualizerId?: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  constraints: string[];
  examples: CatalogExample[];
};
