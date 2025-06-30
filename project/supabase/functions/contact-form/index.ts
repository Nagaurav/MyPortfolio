import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.38.4';
import { rateLimit } from 'npm:lambda-rate-limiter@3.0.0';

// Initialize rate limiter (10 requests per IP per minute)
const limiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 500
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Max-Age': '86400',
  // Security headers
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Security': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    try {
      await limiter.check(10, clientIP); // 10 requests per interval
    } catch {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }

    // Verify CSRF token
    const csrfToken = req.headers.get('X-CSRF-Token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get request body
    const { name, email, subject, message } = await req.json();

    // Input validation and sanitization
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message)
    };

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Insert sanitized data
    const { error: insertError } = await supabaseClient
      .from('contacts')
      .insert([sanitizedData]);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: 'Message sent successfully' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Helper functions
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/[&]/g, '&amp;')
    .replace(/["]/g, '&quot;')
    .replace(/[']/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function validateCSRFToken(token: string): boolean {
  // In a real application, you would validate against a stored token
  // This is a simplified example
  return token.length === 32;
}