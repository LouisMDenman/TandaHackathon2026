import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the API key
API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please add it to your .env file")
genai.configure(api_key=API_KEY)

# System instruction for crypto-focused assistant
CRYPTO_SYSTEM_INSTRUCTION = """
You are a helpful cryptocurrency assistant for a digital wallet application. Your primary role is to:

1. Answer questions about cryptocurrencies, blockchain technology, digital wallets, transactions, and related topics
2. Help users understand crypto concepts like Bitcoin, Ethereum, altcoins, NFTs, DeFi, gas fees, wallet security, etc.
3. Provide guidance on using digital wallets safely and securely
4. Explain crypto market trends and trading basics

If a user asks about topics unrelated to cryptocurrency:
- Politely acknowledge their question
- Give a brief, friendly response
- Gently redirect the conversation back to crypto topics
- Example: "That's interesting! Though I'm mainly here to help with crypto questions. Speaking of which, is there anything about your digital wallet or cryptocurrency that I can help you with?"

Always be helpful, educational, and encouraging. Keep responses clear and concise.
"""

# Initialize the model with crypto-focused system instruction
model = genai.GenerativeModel(
    'gemini-2.5-flash',
    system_instruction=CRYPTO_SYSTEM_INSTRUCTION
)

def chat():
    """Crypto-focused chatbot interface"""
    print("Crypto Wallet Assistant (type 'quit' to exit)")
    print("Ask me anything about cryptocurrency and digital wallets!")
    print("-" * 50)
    
    # Start a chat session
    chat_session = model.start_chat(history=[])
    
    while True:
        # Get user input
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("Goodbye!")
            break
        
        if not user_input:
            continue
        
        try:
            # Send message and get response
            response = chat_session.send_message(user_input)
            print(f"\nBot: {response.text}")
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    chat()
