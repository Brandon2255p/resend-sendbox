import { NextResponse } from 'next/server';

const RESEND_API_BASE = 'https://api.resend.com';

export async function GET() {
  // Handle GET requests - return OK status
  console.log('GET request received');
  return NextResponse.json({ status: 'ok', message: 'Resend API proxy endpoint' });
}

export async function HEAD() {
  console.log('HEAD request received');
  return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    console.log('POST request received, method in body:', request.method, 'URL:', url.pathname);
    const body = await request.json();
    const { apiKey, endpoint, method = 'GET', data } = body;

    if (!apiKey) {
      console.log('API key missing from request');
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('Proxying request:', { endpoint, method, hasData: !!data });

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
        { error: responseData.message || 'Resend API error', details: responseData },
        { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Resend API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Resend API' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
