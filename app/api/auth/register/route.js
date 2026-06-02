import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: hashed });

    return NextResponse.json(
      { message: 'Account created.', userId: user._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
