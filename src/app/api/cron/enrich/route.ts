import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Handle both POST and GET requests
export async function POST() {
  return handleRequest();
}

export async function GET() {
  return handleRequest();
}

async function handleRequest() {
  // Call the Supabase Edge Function
  const res = await fetch('https://loaparhdfcqcxragkbel.functions.supabase.co/enrich-batch', {
    method: 'POST',
    // headers: { 'Authorization': 'Bearer ...' }, // If you re-enable JWT
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
} 