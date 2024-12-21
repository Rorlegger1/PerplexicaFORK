import { ChatOpenAI } from '@langchain/openai';
import { getOpenRouterApiKey, getOpenRouterHttpReferer, getOpenRouterAppName } from '../../config';
import logger from '../../utils/logger';

export const loadOpenRouterChatModels = async () => {
  const openRouterApiKey = getOpenRouterApiKey();
  const httpReferer = getOpenRouterHttpReferer();
  const appName = getOpenRouterAppName();

  if (!openRouterApiKey) return {};

  try {
    const chatModels = {
      'gemini-2': {
        displayName: 'Gemini 2.0',
        model: new ChatOpenAI(
          {
            openAIApiKey: openRouterApiKey,
            modelName: 'google/gemini-2.0-flash-thinking-exp:free',
            temperature: 0.7,
          },
          {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': httpReferer || '',
              'X-Title': appName || '',
            },
          },
        ),
      },
    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading OpenRouter models: ${err}`);
    return {};
  }
}; 