// AI Core Module - Stub for build compatibility

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  content?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface AICore {
  chat: (messages: AIMessage[], config?: any) => Promise<AIResponse>;
  validateInput: (options: { text: string; maxLength: number }) => ValidationResult;
}

export const DEFAULT_CONFIGS = {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  AURORA_ANALYZER: {
    model: 'gpt-4-turbo',
    temperature: 0.7,
  },
  TRIPPLAN_CURATOR: {
    model: 'gpt-4-turbo',
    temperature: 0.7,
  },
};

export function createSystemMessage(content: string): AIMessage {
  return { role: 'system', content };
}

export function formatMessages(messages: AIMessage[]): AIMessage[] {
  return messages;
}

export function getAICore(): AICore {
  return {
    chat: async (messages: AIMessage[], config?: any): Promise<AIResponse> => {
      return { success: false, error: 'AI Core not implemented' };
    },
    validateInput: ({ text, maxLength }): ValidationResult => {
      if (text.length > maxLength) {
        return { valid: false, error: `Input exceeds max length of ${maxLength}` };
      }
      return { valid: true };
    },
  };
}
