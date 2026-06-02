import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/lib/models/Schedule';

async function getUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(_request, { params }) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const schedule = await Schedule.findOne({ _id: id, userId });
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(schedule);
}

export async function PUT(request, { params }) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const body = await request.json();
  const schedule = await Schedule.findOneAndUpdate(
    { _id: id, userId },
    body,
    { new: true, runValidators: true }
  );
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(schedule);
}

export async function DELETE(_request, { params }) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const schedule = await Schedule.findOneAndDelete({ _id: id, userId });
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Schedule deleted' });
}
