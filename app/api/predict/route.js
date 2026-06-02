import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { predictModel } from '@/lib/gemini';
import { buildContext } from '@/lib/buildContext';

const SCHEMA = `{
  "highRiskTimes": [
    { "elixir": "string", "timeOfDay": "string", "missRate": "number", "reason": "string" }
  ],
  "nudgeMessage": "string",
  "overallRisk": "low | moderate | high",
  "summary": "string"
}`;

export async function GET() {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const context = await buildContext({ historyDays: 14, userId });

    const prompt = `You are a wellness AI assistant for the Alchemist's Grand Grimoire, a mystical medicine tracker.

${context}

Analyze the miss patterns above and return a JSON object matching this exact schema:
${SCHEMA}

Rules:
- highRiskTimes: list up to 3 elixir+time combinations with the highest miss rates. Only include if miss rate > 20% AND at least 3 data points. Leave empty array if no data.
- nudgeMessage: a single friendly, circus-themed sentence warning about the top risk. If no risk patterns found, write an encouraging message.
- overallRisk: "low" if average miss rate < 20%, "moderate" if 20-50%, "high" if > 50%. Default "low" if no history.
- summary: 1-2 sentence human-readable summary of adherence patterns.

Return ONLY valid JSON, no markdown, no explanation.`;

    const result = await predictModel.generateContent(prompt);
    const text   = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        highRiskTimes: [],
        nudgeMessage: 'The Grimoire is still gathering your mystical patterns. Keep logging your elixirs!',
        overallRisk: 'low',
        summary: 'Not enough data yet to detect patterns.',
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Predict error:', err);
    return NextResponse.json({ error: err.message || 'Prediction failed' }, { status: 500 });
  }
}
