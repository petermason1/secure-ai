import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'Requests';

export async function POST(request: NextRequest) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      {
        error: 'Airtable environment variables are missing',
        details: 'Set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID',
      },
      { status: 500 },
    );
  }

  try {
    const { name, email, message, source } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 },
      );
    }

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      AIRTABLE_TABLE_ID,
    )}`;

    const recordPayload = {
      records: [
        {
          fields: {
            Name: name,
            Email: email,
            Message: message,
            Source: source || 'Website',
            Status: 'New',
          },
        },
      ],
    };

    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordPayload),
    });

    if (!airtableResponse.ok) {
      const errorBody = await airtableResponse.text();
      return NextResponse.json(
        { error: 'Failed to create Airtable record', details: errorBody },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact request' },
      { status: 500 },
    );
  }
}


