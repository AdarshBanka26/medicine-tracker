import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { chatModel } from '@/lib/gemini';
import { buildContext } from '@/lib/buildContext';

const SYSTEM_PREAMBLE = `You are the Mystic Fortune Teller, an AI health assistant inside the Alchemist's Grand Grimoire — a mystical medicine tracker for circus performers.

Personality: wise, warm, slightly theatrical. Keep responses concise (2-5 sentences). Use plain language with a touch of circus/alchemy flair.

You only answer questions about the performer's medication schedules and adherence history. Never give medical advice — only report facts from the records and encourage adherence.`;

export async function POST(request) {
  try {
    const session = await auth();
    const userId  = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { history = [], message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const context = await buildContext({ historyDays: 7, userId });

    const geminiHistory = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PREAMBLE}\n\nHere is the current Grimoire data:\n\n${context}` }],
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I have consulted the Grand Grimoire and am ready to answer the performer's questions." }],
      },
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    ];

    const chat   = chatModel.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);

    return NextResponse.json({ text: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { error: err.message || 'The crystal ball is clouded. Please try again.' },
      { status: 500 }
    );
  }
}
