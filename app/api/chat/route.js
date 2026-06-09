import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { chatModel } from '@/lib/gemini';
import { buildContext } from '@/lib/buildContext';

const SYSTEM_PREAMBLE = `You are a medication tracking assistant. Answer questions about the user's medication schedules and adherence history.

Be direct and concise. Use plain, everyday language — no metaphors, dramatic phrasing, or themed language. When listing items, use bullet points or numbered lists. Keep answers short and to the point.

Only answer questions about medication schedules and adherence history. Never give medical advice — only report facts from the records and encourage adherence.`;

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
        parts: [{ text: `${SYSTEM_PREAMBLE}\n\nHere is the user's current medication data:\n\n${context}` }],
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I have reviewed the medication data and am ready to answer your questions." }],
      },
      ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    ];

    const chat   = chatModel.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);

    return NextResponse.json({ text: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
