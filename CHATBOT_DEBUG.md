# Chatbot Debugging Guide

## Changes Made
1. ✅ Added detailed error logging to `/app/api/chat/route.ts`
2. ✅ Updated `CryptoAssistant.tsx` to display specific error messages
3. ✅ Better error handling for API responses

## Checklist to Fix Chatbot on Netlify

### Step 1: Verify Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Make sure you have a valid API key
3. Test the key is working by making a test request

### Step 2: Add Environment Variable in Netlify
1. Go to your Netlify dashboard
2. Navigate to: **Site settings → Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key (paste the full key)
   - **Scopes**: All (Production, Deploy Previews, Branch Deploys)
5. Click **Save**

### Step 3: Redeploy
1. After adding the environment variable, go to **Deploys** tab
2. Click **Trigger deploy → Clear cache and deploy site**
3. Wait for deployment to complete

### Step 4: Test the Chatbot
1. Open your deployed site
2. Click the floating chatbot button (bottom right)
3. Send a test message like "What is Bitcoin?"
4. Check the response

### Step 5: If Still Not Working - Check Logs
1. In Netlify, go to **Functions** tab
2. Find the `chat` function
3. Click on it to see the logs
4. Look for error messages that will now show:
   - "GEMINI_API_KEY not found" → Environment variable not set
   - "API returned status XXX" → Invalid API key or API issue
   - Other specific error messages

## Common Issues

### Issue 1: "API key not configured"
**Solution**: The `GEMINI_API_KEY` is not set in Netlify environment variables. Follow Step 2 above.

### Issue 2: "Failed to get response from AI"
**Possible causes**:
- Invalid API key
- API key doesn't have permission to use gemini-2.5-flash model
- Gemini API is down or rate limited

**Solution**: 
- Verify your API key is correct
- Try using a different model like `gemini-1.5-flash` or `gemini-pro`

### Issue 3: "Invalid response from AI"
**Solution**: The model might be returning an unexpected format. Check the Netlify function logs for details.

## Testing Locally

To test locally before deploying:

1. Create `.env.local` file in `my-app/` directory:
```
GEMINI_API_KEY=your_actual_api_key_here
```

2. Run dev server:
```bash
cd my-app
npm run dev
```

3. Test the chatbot on `http://localhost:3000`

## Model Alternatives

If `gemini-2.5-flash` doesn't work, try these alternatives in `/app/api/chat/route.ts` line 78:

- `gemini-1.5-flash` (most reliable)
- `gemini-1.5-pro`
- `gemini-pro`

Change line 78 from:
```typescript
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}
```

To:
```typescript
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}
```

## Need More Help?

If the error still persists:
1. Check the browser console (F12) for client-side errors
2. Check Netlify function logs for server-side errors
3. The updated error messages will now tell you exactly what's wrong
