# API Integration Fix - Implementation Guide

## Problem
The Together.ai API calls from your browser are failing due to CORS (Cross-Origin Resource Sharing) restrictions. Browsers block direct API calls to external services for security.

## Solution: Use Supabase Edge Functions as Proxy

### Step 1: Create Supabase Edge Function

You need to create an Edge Function in your Supabase project that will act as a proxy for Together.ai API calls.

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to: **Edge Functions** (left sidebar)
4. Click **Create new function**
5. Name it: `together-proxy`
6. Replace the generated code with this:

```typescript
// supabase/functions/together-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TOGETHER_API_KEY = Deno.env.get("TOGETHER_API_KEY")
const TOGETHER_API_URL = "https://api.together.xyz/v1/completions"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { prompt, options } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400 }
      )
    }

    const requestBody = {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt: prompt,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1024,
      top_p: options?.top_p ?? 0.95,
      top_k: options?.top_k ?? 40,
    }

    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Together API error: ${data.error?.message || response.statusText}`)
    }

    return new Response(
      JSON.stringify({ result: data.choices[0].text }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
```

### Step 2: Set Environment Variable in Supabase

1. In Supabase dashboard, go to **Settings** → **Environment**
2. Add a new secret:
   - **Name:** `TOGETHER_API_KEY`
   - **Value:** `074cf358e9cf42a2dca649dd980440b6a310d8249d0b9c6f47c97a39f06a9279` (your key from config.js)
3. Click **Add**

### Step 3: Update Your HTML to Use the Proxy

In your **interview.html**, add this script BEFORE your other scripts:

```html
<!-- Add this before other scripts -->
<script src="supabase-together-proxy.js"></script>
```

And update **together-api.js** to use Supabase when available:

Replace the `makeRequest` method with:

```javascript
async makeRequest(prompt, options = {}) {
  // Try Supabase proxy first
  if (window.SupabaseTogetherProxy && window.SupabaseTogetherProxy.supabase) {
    try {
      this.logToPage(`🔄 Making API request through Supabase...`);
      const result = await window.SupabaseTogetherProxy.callTogetherAPI(prompt, options);
      this.logToPage(`✅ API request successful`);
      return result;
    } catch (error) {
      this.logToPage(`⚠️ Supabase proxy error, trying direct API...`);
      // Fall back to direct call below
    }
  }

  // Original direct API call (will still fail with CORS, but kept for reference)
  if (!this.isInitialized) {
    const error = new Error("Together API not initialized with valid API key");
    this.logToPage(`❌ API Error: ${error.message}`);
    throw error;
  }

  try {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        top_p: options.top_p ?? 0.95,
        top_k: options.top_k ?? 40
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    this.logToPage(`✅ API request successful`);
    return data.choices[0].text;
  } catch (error) {
    this.logToPage(`❌ API Error: ${error.message}`);
    console.error("Error calling API:", error);
    throw error;
  }
}
```

### Step 4: Test the Integration

1. Open your application in browser
2. Open Developer Console (F12)
3. Go to the Interview page
4. Select a career and try to generate questions
5. Check the console for success messages

## Troubleshooting

### If you see "Supabase not initialized"
- Check that your Supabase URL and anon key are correctly set in `config.js`
- Make sure `SUPABASE.ENABLE` is set to `true`

### If you see "Together API error"
- Verify your TOGETHER_API_KEY in Supabase environment variables
- Check that the key is not expired

### If you see "Invalid response format"
- This might mean the API is returning an error
- Check Supabase function logs in the dashboard

## Alternative: Use a Node.js Backend (If Supabase doesn't work)

If you prefer, you can create a simple Express.js backend:

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/together', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        prompt,
        ...options
      })
    });
    
    const data = await response.json();
    res.json({ result: data.choices[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

Then update together-api.js to call `http://localhost:3000/api/together` instead.

## Summary

The key issue was **CORS blocking direct browser-to-API calls**. By routing through Supabase (or a backend), you bypass this restriction and your API integration will work properly.
