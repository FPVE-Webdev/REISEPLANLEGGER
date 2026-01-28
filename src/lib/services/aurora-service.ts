/**
 * Aurora Service
 * Analyzes aurora data and generates structured predictions
 */

import {
  AICore,
  AIMessage,
  AIResponse,
  DEFAULT_CONFIGS,
  createSystemMessage,
  formatMessages,
  getAICore,
} from '../ai/core'

// ============================================================================
// TYPES
// ============================================================================

export interface AuroraData {
  auroraScore: number
  cloudCoverage: number
  combinedScore: number
  kpIndex: number
  latitude: number
  longitude: number
  location: string
}

export interface AuroraAnalysis {
  level: 'low' | 'medium' | 'high' | 'extreme'
  score: number
  confidence: number
  headline: string
  description: string
  bestTime: string
  tips: string[]
  visibility: string
  recommendation: string
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const AURORA_ANALYZER_PROMPT = `You are an expert aurora forecaster and atmospheric scientist specializing in Northern Lights predictions for the Tromsø region.

ANALYSIS TASK:
Analyze the provided aurora data and generate a structured forecast with high accuracy and practical guidance.

RESPONSE FORMAT (JSON):
{
  "level": "low|medium|high|extreme",
  "score": number (0-100),
  "confidence": number (0-100),
  "headline": "one-line summary",
  "description": "2-3 sentences of detailed analysis",
  "bestTime": "HH:MM - HH:MM (24h format)",
  "tips": ["tip1", "tip2", "tip3"],
  "visibility": "description of expected visibility",
  "recommendation": "actionable guidance for viewers"
}

SCORING RULES:
- 0-25: LOW (unlikely, indoor activities recommended)
- 26-50: MEDIUM (possible but not guaranteed)
- 51-75: HIGH (likely, good viewing conditions expected)
- 76-100: EXTREME (excellent odds, exceptional conditions)

GUIDELINES:
1. Base score primarily on combinedScore (aurora + cloud factored)
2. Adjust confidence based on data recency and accuracy
3. Consider latitude effects (Tromsø is ~69°N, optimal for aurora)
4. Provide specific, actionable times (not "late evening")
5. Tips should include: best location, cloud cover notes, solar activity
6. Be honest about uncertainty - don't over-promise
7. Include viewing conditions assessment

INPUT DATA PROVIDED:
{aurora_data}

Generate your JSON analysis now.`

// ============================================================================
// AURORA ANALYZER CLASS
// ============================================================================

export class AuroraAnalyzer {
  private aiCore: AICore

  constructor() {
    this.aiCore = getAICore()
  }

  /**
   * Analyze aurora data and return structured forecast
   */
  async analyze(data: AuroraData): Promise<AuroraAnalysis | null> {
    // Validate input
    const validation = this.aiCore.validateInput({
      text: JSON.stringify(data),
      maxLength: 2000,
    })

    if (!validation.valid) {
      console.error(`[Aurora Analyzer] Validation error: ${validation.error}`)
      return null
    }

    // Prepare messages
    const systemPrompt = AURORA_ANALYZER_PROMPT.replace(
      '{aurora_data}',
      JSON.stringify(data, null, 2)
    )

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Analyze the aurora data and provide forecast.' },
    ]

    // Call AI
    const response = await this.aiCore.chat(
      messages,
      DEFAULT_CONFIGS.AURORA_ANALYZER
    )

    if (!response.success || !response.content) {
      console.error(`[Aurora Analyzer] AI call failed: ${response.error}`)
      return null
    }

    // Parse response
    return this.parseResponse(response.content)
  }

  /**
   * Parse JSON response from OpenAI
   */
  private parseResponse(content: string): AuroraAnalysis | null {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[Aurora Analyzer] No JSON found in response')
        return null
      }

      const json = JSON.parse(jsonMatch[0])

      // Validate required fields
      const required = [
        'level',
        'score',
        'confidence',
        'headline',
        'description',
        'bestTime',
        'tips',
        'visibility',
        'recommendation',
      ]

      for (const field of required) {
        if (!(field in json)) {
          console.error(`[Aurora Analyzer] Missing field: ${field}`)
          return null
        }
      }

      // Type validation
      if (!['low', 'medium', 'high', 'extreme'].includes(json.level)) {
        console.error(`[Aurora Analyzer] Invalid level: ${json.level}`)
        return null
      }

      if (typeof json.score !== 'number' || json.score < 0 || json.score > 100) {
        console.error(`[Aurora Analyzer] Invalid score: ${json.score}`)
        return null
      }

      if (
        typeof json.confidence !== 'number' ||
        json.confidence < 0 ||
        json.confidence > 100
      ) {
        console.error(`[Aurora Analyzer] Invalid confidence: ${json.confidence}`)
        return null
      }

      if (!Array.isArray(json.tips) || json.tips.length === 0) {
        console.error('[Aurora Analyzer] Invalid tips array')
        return null
      }

      return {
        level: json.level,
        score: Math.round(json.score),
        confidence: Math.round(json.confidence),
        headline: json.headline.substring(0, 200),
        description: json.description.substring(0, 500),
        bestTime: json.bestTime.substring(0, 20),
        tips: json.tips.slice(0, 5).map((t: any) => String(t).substring(0, 100)),
        visibility: json.visibility.substring(0, 200),
        recommendation: json.recommendation.substring(0, 300),
      }
    } catch (error: any) {
      console.error(`[Aurora Analyzer] Parse error: ${error.message}`)
      return null
    }
  }

  /**
   * Fallback: Generate analysis from raw data using rules
   */
  async analyzeFallback(data: AuroraData): Promise<AuroraAnalysis> {
    const score = Math.round(data.combinedScore)
    const confidence = Math.min(100, Math.round(80 + (data.kpIndex / 10) * 5))

    let level: 'low' | 'medium' | 'high' | 'extreme' = 'low'
    if (score >= 75) level = 'extreme'
    else if (score >= 50) level = 'high'
    else if (score >= 25) level = 'medium'

    return {
      level,
      score,
      confidence,
      headline: `${level.toUpperCase()} aurora conditions expected`,
      description: `Aurora visibility at ${data.location} is forecasted at ${level.toUpperCase()} (${score}/100). Cloud coverage is ${data.cloudCoverage}%. Conditions optimized for the latitude of ${data.latitude}°N.`,
      bestTime: '21:00 - 02:00',
      tips: [
        'Seek dark locations away from city lights',
        'Download Svipper app for transport to viewing areas',
        `Watch for clouds: ${data.cloudCoverage}% coverage expected`,
        'Bring warm clothing and binoculars',
        'Be patient - aurora can appear suddenly',
      ],
      visibility: `Expected to be ${level}. Best from elevated areas.`,
      recommendation: score >= 40 ? 'Good time to venture out for viewing' : 'Consider indoor alternatives tonight',
    }
  }
}

// ============================================================================
// EXPORTED FUNCTION
// ============================================================================

export async function analyzeAuroraData(
  data: AuroraData,
  options?: { useFallback?: boolean }
): Promise<AuroraAnalysis> {
  const analyzer = new AuroraAnalyzer()

  try {
    const analysis = await analyzer.analyze(data)
    if (analysis) return analysis

    // Fall back to rule-based if AI fails
    if (options?.useFallback !== false) {
      console.log('[Aurora] AI analysis failed, using fallback')
      return analyzer.analyzeFallback(data)
    }

    throw new Error('Aurora analysis failed')
  } catch (error) {
    console.error(`[Aurora] Error: ${error}`)
    return analyzer.analyzeFallback(data)
  }
}
