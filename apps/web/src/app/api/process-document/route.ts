/**
 * Big Technical Execution Engine - Tier 1: Invoice Processor
 * 
 * Feature: Intelligent Document Classifier & Data Extractor
 * API Route: /app/api/process-document/route.ts
 * 
 * This Vercel Serverless Function handles:
 * 1. PDF file upload to Supabase Storage
 * 2. PDF text extraction (OCR/parsing)
 * 3. OpenAI Function Calling for structured data extraction
 * 4. Routing logic (auto-pay vs manager review)
 * 5. Database storage and webhook triggers
 * 
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPABASE_STORAGE_BUCKET (default: 'invoices')
 * - OPENAI_API_KEY
 * - WEBHOOK_URL (optional, for manager review notifications)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ============================================================================
// SUPABASE CLIENT SETUP
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'invoices';

// ============================================================================
// OPENAI CLIENT SETUP
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ============================================================================
// PDF TEXT EXTRACTION (Simplified - in production, use pdf-parse or API)
// ============================================================================

/**
 * Extract text from PDF
 * Note: This is a placeholder. In production, use:
 * - pdf-parse library (npm install pdf-parse)
 * - Or external OCR service (Google Vision, AWS Textract)
 * - Or Supabase Edge Function for server-side processing
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For MVP, we'll use OpenAI Vision API to read PDF images
  // Or convert PDF to images first, then OCR
  
  // Placeholder: Return file name as text (replace with actual extraction)
  // In production, implement proper PDF parsing
  return `PDF Content from ${file.name}`;
}

// ============================================================================
// OPENAI FUNCTION CALLING SCHEMA
// ============================================================================

const extractInvoiceDataFunction = {
  name: 'extract_invoice_data',
  description: 'Extract structured data from an invoice document',
  parameters: {
    type: 'object',
    properties: {
      document_type: {
        type: 'string',
        description: 'Type of document (should be "invoice")',
      },
      document_id: {
        type: 'string',
        description: 'Unique identifier for this invoice (invoice number)',
      },
      supplier_name: {
        type: 'string',
        description: 'Name of the supplier/vendor',
      },
      invoice_date: {
        type: 'string',
        description: 'Invoice date in YYYY-MM-DD format',
      },
      due_date: {
        type: 'string',
        description: 'Due date in YYYY-MM-DD format',
      },
      total_amount_due: {
        type: 'number',
        description: 'Total amount due (numeric value only)',
      },
      currency: {
        type: 'string',
        description: 'Currency code (e.g., GBP, USD, EUR)',
      },
      line_items: {
        type: 'array',
        description: 'List of line items on the invoice',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number' },
            unit_price: { type: 'number' },
            line_total: { type: 'number' },
          },
          required: ['description', 'quantity', 'unit_price', 'line_total'],
        },
      },
      validation_status: {
        type: 'boolean',
        description: 'Whether the invoice data is valid and complete',
      },
      validation_flag_reason: {
        type: 'string',
        description: 'Reason if validation_status is false, empty string if valid',
      },
    },
    required: [
      'document_type',
      'document_id',
      'supplier_name',
      'invoice_date',
      'due_date',
      'total_amount_due',
      'currency',
      'line_items',
      'validation_status',
      'validation_flag_reason',
    ],
  },
};

// ============================================================================
// ROUTING LOGIC
// ============================================================================

/**
 * Determine routing status based on total amount
 */
function determineRoutingStatus(totalAmount: number): 'READY_FOR_AUTO_PAY' | 'PENDING_MANAGER_REVIEW' {
  return totalAmount < 5000 ? 'READY_FOR_AUTO_PAY' : 'PENDING_MANAGER_REVIEW';
}

/**
 * Send webhook notification (for manager review)
 */
async function sendWebhookNotification(documentId: string, data: any) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'invoice_requires_review',
        document_id: documentId,
        total_amount: data.total_amount_due,
        currency: data.currency,
        supplier_name: data.supplier_name,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
    // Don't throw - webhook failure shouldn't break the flow
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse form data (file upload)
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Step 1: Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    // Step 2: Extract text from PDF
    const pdfText = await extractTextFromPDF(file);

    // Step 3: Use OpenAI Function Calling to extract structured data
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4' for better accuracy
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting structured data from invoices. 
          Extract all relevant information from the invoice text provided by the user.
          Be precise with dates (use YYYY-MM-DD format), amounts (numeric only), and currency codes.
          If any required field cannot be found, set validation_status to false and provide a reason.`,
        },
        {
          role: 'user',
          content: `Extract invoice data from the following text:\n\n${pdfText}`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: extractInvoiceDataFunction,
        },
      ],
      tool_choice: { type: 'function', function: { name: 'extract_invoice_data' } },
      temperature: 0.1, // Low temperature for consistent extraction
    });

    // Extract function call result
    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_invoice_data') {
      throw new Error('Failed to extract invoice data');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    // Step 4: Determine routing status
    const routingStatus = determineRoutingStatus(extractedData.total_amount_due);

    // Step 5: Generate document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Step 6: Store in Supabase database
    const { error: dbError } = await supabase.from('documents').insert({
      id: documentId,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      document_type: extractedData.document_type,
      routing_status: routingStatus,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Continue even if DB insert fails (don't break the flow)
    }

    // Store extracted data
    const { error: dataError } = await supabase.from('extracted_data').insert({
      document_id: documentId,
      extracted_data: extractedData,
      created_at: new Date().toISOString(),
    });

    if (dataError) {
      console.error('Extracted data insert error:', dataError);
    }

    // Step 7: Log processing
    await supabase.from('processing_logs').insert({
      document_id: documentId,
      stage: 'complete',
      status: 'success',
      routing_status: routingStatus,
      created_at: new Date().toISOString(),
    });

    // Step 8: Send webhook if manager review required
    if (routingStatus === 'PENDING_MANAGER_REVIEW') {
      await sendWebhookNotification(documentId, extractedData);
    }

    // Step 9: Return response
    return NextResponse.json({
      success: true,
      document_id: documentId,
      extracted_data: extractedData,
      routing_status: routingStatus,
      file_url: fileUrl,
    });
  } catch (error) {
    console.error('API route error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
