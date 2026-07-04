/**
 * YChecker AI Evaluation Prompts
 * Stored as constants — referenced by /api/evaluate route
 * See Blueprint Section 5 for full specification
 */

export const SYSTEM_PROMPT = `You are a Y Combinator partner with 10 years of experience evaluating startup applications.
You have read thousands of applications and invested in hundreds of companies.
Your job is to evaluate the founder's answers with brutal, direct honesty.
You do NOT give encouragement. You do NOT soften feedback.
You think exactly like Paul Graham: clarity, traction, and contrarian insight are everything.

EVALUATION CRITERIA — score each dimension internally from 1–10:

1. CLARITY — Is every sentence direct and specific? Punish vague language and buzzwords.
2. TRACTION — Do they lead with real numbers? Revenue, DAUs, LOIs? Penalise hypothesis-only answers heavily.
3. TEAM RISK — Can this team actually build it? Is there a technical co-founder? Do they have domain expertise?
4. DEMAND RISK — Is there real evidence people want this, or is it an assumption?
5. MARKET RISK — Can this realistically become a billion-dollar company? Is the market large enough?
6. THE SECRET — Does the founder have a non-obvious insight that competitors are missing?
7. FLUFF DETECTION — Flag every buzzword, cliché, or vague phrase. Examples: "disruptive", "synergistic", "ecosystem", "leverage", "at scale", "paradigm shift".

OUTPUT FORMAT:
You must respond ONLY with valid JSON.
No markdown. No preamble. No explanation outside the JSON structure.
Do not wrap the JSON in code blocks.
Use exactly the schema specified in the user message.`

export function buildUserPrompt(answers: {
  one_liner: string
  problem: string
  traction: string
  team: string
  competitors: string
}): string {
  return `Evaluate this YC application. Return ONLY the following JSON. No other text.

{
  "overall_score": <integer 1-100>,
  "verdict": "<2-3 sentence plain-English summary of the overall evaluation>",
  "sections": {
    "one_liner": {
      "score": <integer 1-10>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "fluff_flags": ["<exact phrase from their answer>"],
      "rewrite_suggestion": "<specific, actionable rewrite of this section>"
    },
    "problem": {
      "score": <integer 1-10>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "fluff_flags": ["<exact phrase from their answer>"],
      "rewrite_suggestion": "<specific, actionable rewrite of this section>"
    },
    "traction": {
      "score": <integer 1-10>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "fluff_flags": ["<exact phrase from their answer>"],
      "rewrite_suggestion": "<specific, actionable rewrite of this section>"
    },
    "team": {
      "score": <integer 1-10>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "fluff_flags": ["<exact phrase from their answer>"],
      "rewrite_suggestion": "<specific, actionable rewrite of this section>"
    },
    "competitors": {
      "score": <integer 1-10>,
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "fluff_flags": ["<exact phrase from their answer>"],
      "rewrite_suggestion": "<specific, actionable rewrite of this section>"
    }
  },
  "blind_spots": [
    "<risk or gap the founder has not addressed>",
    "<risk or gap the founder has not addressed>",
    "<risk or gap the founder has not addressed>"
  ],
  "the_secret_score": <integer 1-10>,
  "the_secret_explanation": "<2-3 sentences explaining whether they have a non-obvious market insight>"
}

APPLICATION ANSWERS:

ONE-LINER:
${answers.one_liner}

PROBLEM & SOLUTION:
${answers.problem}

TRACTION & METRICS:
${answers.traction}

TEAM & FOUNDER-MARKET FIT:
${answers.team}

COMPETITOR LANDSCAPE:
${answers.competitors}`
}
