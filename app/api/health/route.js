import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      status: 'ok',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      dbName: mongoose.connection.db?.databaseName ?? 'unknown',
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
