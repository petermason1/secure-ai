import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
// Invoice data extraction schema
const invoiceSchema = {
  type: 'object' as const,
  properties: {
    invoice_number: { type: 'string', description: 'Invoice number or ID' },
    invoice_date: { type: 'string', description: 'Invoice date (YYYY-MM-DD)' },
    due_date: { type: 'string', description: 'Payment due date (YYYY-MM-DD)' },
    vendor_name: { type: 'string', description: 'Vendor or supplier name' },
    total_amount: { type: 'number', description: 'Total invoice amount' },
    currency: { type: 'string', description: 'Currency code (e.g., GBP, USD)' },
    line_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          quantity: { type: 'number' },
          unit_price: { type: 'number' },
          total: { type: 'number' },
        },
      },
    },
  },
  required: ['invoice_number', 'vendor_name', 'total_amount'],
};

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 2. Create document record
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        status: 'PROCESSING',
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`Database insert failed: ${docError.message}`);
    }

    const documentId = docData.id;

    // 3. Log processing start
    await supabase.from('processing_logs').insert({
      document_id: documentId,
      step: 'UPLOAD_COMPLETE',
      details: { file_name: file.name, file_size: file.size },
      is_success: true,
    });

    // 4. Extract text from PDF (placeholder - in production use pdf-parse or OCR)
    // For now, we'll simulate extracted text
    const extractedText = `
      INVOICE
      Invoice Number: INV-2024-001
      Date: 2024-01-15
      Due Date: 2024-02-15
      
      Bill To:
      Acme Corp
      
      From:
      Supplier Ltd
      
      Items:
      1. Web Development Services - Qty: 40 hours - Rate: £100/hr - Total: £4,000
      2. Hosting Services - Qty: 1 month - Rate: £50/mo - Total: £50
      
      Subtotal: £4,050
      Tax (20%): £810
      Total: £4,860 GBP
    `;

    await supabase.from('processing_logs').insert({
      document_id: documentId,
      step: 'TEXT_EXTRACTION_COMPLETE',
      details: { text_length: extractedText.length },
      is_success: true,
    });

    // 5. OpenAI Function Calling for structured extraction
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from invoices. Extract all relevant invoice information accurately.',
        },
        {
          role: 'user',
          content: `Extract invoice data from this text:\n\n${extractedText}`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'extract_invoice_data',
            description: 'Extract structured invoice data',
            parameters: invoiceSchema,
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'extract_invoice_data' } },
    });

    // Extract function call result
    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.type !== 'function' || toolCall.function.name !== 'extract_invoice_data') {
      throw new Error('Failed to extract invoice data');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    await supabase.from('processing_logs').insert({
      document_id: documentId,
      step: 'AI_EXTRACTION_COMPLETE',
      details: extractedData,
      is_success: true,
    });

    // 6. Store extracted data
    await supabase.from('extracted_data').insert({
      document_id: documentId,
      data_type: 'INVOICE',
      extracted_json: extractedData,
    });

    // 7. Routing logic (Rule-based)
    let routingStatus = 'PENDING_REVIEW';
    const amount = extractedData.total_amount || 0;

    if (amount < 1000) {
      routingStatus = 'AUTO_APPROVED';
    } else if (amount >= 1000 && amount < 5000) {
      routingStatus = 'MANAGER_REVIEW';
    } else {
      routingStatus = 'DIRECTOR_APPROVAL';
    }

    await supabase.from('processing_logs').insert({
      document_id: documentId,
      step: 'ROUTING_COMPLETE',
      details: { routing_status: routingStatus, amount },
      is_success: true,
    });

    // 8. Update document status
    await supabase
      .from('documents')
      .update({
        status: 'COMPLETE',
        routing_status: routingStatus,
      })
      .eq('id', documentId);

    return NextResponse.json({
      success: true,
      document_id: documentId,
      extracted_data: extractedData,
      routing_status: routingStatus,
    });
  } catch (error: any) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
