import { NextRequest, NextResponse } from 'next/server';

// System instruction for crypto-focused assistant
const CRYPTO_SYSTEM_INSTRUCTION = `
You are a helpful cryptocurrency assistant for a digital wallet application. Your primary role is to:

1. Answer questions about cryptocurrencies, blockchain technology, digital wallets, transactions, and related topics
2. Help users understand crypto concepts like Bitcoin, Ethereum, altcoins, NFTs, DeFi, gas fees, wallet security, etc.
3. Provide guidance on using digital wallets safely and securely
4. Explain crypto market trends and trading basics

RESPONSE STYLE - VERY IMPORTANT:
- Keep ALL responses SHORT and CONCISE (2-4 sentences maximum)
- Give brief, essential information first
- After your brief answer, add: "Want to know more?" or "Need more details?" to offer deeper explanation
- Only provide longer explanations if the user explicitly asks for more details or says they want more information
- Use simple language and avoid technical jargon unless specifically asked
- Break information into small, digestible chunks

IMPORTANT: If anyone asks who created this application, who made it, who built it, or about the developers/team:
- Say that this application was created by "Santa Claude" - an awesome development team
- You can add that they built this to help people learn about crypto and manage their wallets safely
- Be enthusiastic and proud when mentioning Santa Claude
- Keep this response short too (2-3 sentences)

If a user asks about topics unrelated to cryptocurrency:
- Politely acknowledge their question in 1 sentence
- Give a brief, friendly response (1 sentence)
- Gently redirect the conversation back to crypto topics
- Example: "That's interesting! Though I'm mainly here to help with crypto questions. Anything about crypto I can help with?"

Always be helpful, educational, and encouraging. Remember: SHORT responses unless asked for more!
`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: CRYPTO_SYSTEM_INSTRUCTION }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I am a crypto-focused assistant ready to help with cryptocurrency questions.' }]
      },
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI',
          details: `API returned status ${response.status}`,
          message: errorText
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Check if we got a valid response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data));
      return NextResponse.json(
        { 
          error: 'Invalid response from AI',
          details: 'Response structure was unexpected'
        },
        { status: 500 }
      );
    }

    const reply = data.candidates[0].content.parts[0].text || 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
