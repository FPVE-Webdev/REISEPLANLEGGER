import OpenAI from 'openai';
import type { TripPlan } from '@/types/trip';
import type { ChatCompletionContentPartText } from 'openai/resources';

/**
 * OpenAI Client for Trip Planning
 *
 * Handles GPT-4 API calls for AI-powered trip plan generation
 * with proper error handling and fallback mechanisms
 */

// Lazy-loaded OpenAI client to avoid initialization errors at build time
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

export interface OpenAICallOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Call OpenAI GPT-4 API for trip plan generation
 *
 * @param options - Configuration for the API call
 * @returns Parsed TripPlan object or null if API fails
 */
export async function callOpenAIForTripPlan(
  options: OpenAICallOptions
): Promise<TripPlan | null> {
  const {
    systemPrompt,
    userMessage,
    maxTokens = 2000,
    temperature = 0.7,
  } = options;

  try {
    // Get OpenAI client
    const client = getOpenAIClient();
    if (!client) {
      console.error('OPENAI_API_KEY environment variable not set');
      return null;
    }

    // Call GPT-4 API
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract response text from choices
    const responseText = response.choices
      .filter(choice => choice.message.content)
      .map(choice => choice.message.content)
      .join('');

    if (!responseText) {
      console.error('Empty response from OpenAI API');
      return null;
    }

    // Log API usage for monitoring
    logOpenAIUsage({
      model: 'gpt-4',
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    });

    // Parse JSON response
    const tripPlan = parseOpenAIResponse(responseText);
    return tripPlan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('OpenAI API call failed:', errorMessage);

    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }

    return null;
  }
}

/**
 * Parse OpenAI's JSON response into a TripPlan object
 * Handles both properly formatted JSON and JSON embedded in markdown code blocks
 *
 * @param responseText - The raw response text from OpenAI
 * @returns Parsed TripPlan or null if parsing fails
 */
function parseOpenAIResponse(responseText: string): TripPlan | null {
  try {
    let jsonString = responseText;

    // If response is wrapped in markdown code blocks, extract JSON
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    // Parse and validate JSON structure
    const parsed = JSON.parse(jsonString);

    // Validate required TripPlan fields
    if (
      !parsed.summary ||
      !Array.isArray(parsed.days) ||
      typeof parsed.totalCost !== 'number' ||
      !Array.isArray(parsed.safetyNotes) ||
      !Array.isArray(parsed.packingList) ||
      !Array.isArray(parsed.recommendations)
    ) {
      console.error('Invalid TripPlan structure:', parsed);
      return null;
    }

    // Validate day plans
    for (const day of parsed.days) {
      if (
        typeof day.day !== 'number' ||
        typeof day.date !== 'string' ||
        typeof day.theme !== 'string' ||
        !Array.isArray(day.activities) ||
        !day.dining
      ) {
        console.error('Invalid DayPlan structure:', day);
        return null;
      }
    }

    return parsed as TripPlan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to parse OpenAI response:', errorMessage);
    return null;
  }
}

/**
 * Log OpenAI API usage for monitoring and cost tracking
 */
function logOpenAIUsage(usage: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[OpenAI Usage]', {
      timestamp: new Date().toISOString(),
      ...usage,
    });
  }

  // In production, you might want to:
  // 1. Send to Sentry for monitoring
  // 2. Log to a database
  // 3. Send to a monitoring service for cost tracking

  // Example for Sentry (commented out - add only if Sentry is configured):
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureMessage(`OpenAI API usage: ${usage.totalTokens} tokens`, 'info');
  // }
}

/**
 * Check if OpenAI API is available and authenticated
 */
export async function isOpenAIAvailable(): Promise<boolean> {
  const client = getOpenAIClient();
  if (!client) {
    return false;
  }

  try {
    // Quick test by listing models - minimal cost
    const models = await client.models.list();
    return models.data && models.data.length > 0;
  } catch (error) {
    console.error('OpenAI availability check failed:', error);
    return false;
  }
}
