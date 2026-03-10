import { NextResponse } from 'next/server';

const RESEND_API_BASE = 'https://api.resend.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, endpoint, method = 'GET', data } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${RESEND_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.message || 'Resend API error' },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Resend API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Resend API' },
      { status: 500 }
    );
  }
}
