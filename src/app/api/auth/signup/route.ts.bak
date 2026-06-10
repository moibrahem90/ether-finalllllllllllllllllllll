import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log("Checking existing user...");
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.log("Existing user checked:", existingUser);

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-me');
    const token = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Create the response and set the cookie
    const response = NextResponse.json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
