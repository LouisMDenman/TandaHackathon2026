/**
 * Solana RPC Proxy API Route
 * Proxies requests to Solana RPC endpoints to avoid CORS and rate limit issues
 */

import { NextRequest, NextResponse } from 'next/server';

// Public Solana RPC endpoints to try
const SOLANA_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.rpc.extrnode.com',
];

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON-RPC request from the client
    const body = await request.json();

    // Validate it's a proper JSON-RPC request
    if (!body.jsonrpc || !body.method) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || 1,
          error: {
            code: -32600,
            message: 'Invalid JSON-RPC request',
          },
        },
        { status: 400 }
      );
    }

    // Try each endpoint until one succeeds
    let lastError: Error | null = null;

    for (const endpoint of SOLANA_RPC_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Return the successful response
        return NextResponse.json(data);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        // Continue to next endpoint
        continue;
      }
    }

    // All endpoints failed
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id || 1,
        error: {
          code: -32603,
          message: `All Solana RPC endpoints failed: ${lastError?.message || 'Unknown error'}`,
        },
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Solana RPC proxy error:', error);

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
