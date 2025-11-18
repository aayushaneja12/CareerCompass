import os
from supabase import create_client
from dotenv import load_dotenv  # make sure python-dotenv is installed

# Load .env from the project root
load_dotenv()

SUPABASE_URL = os.getenv("https://mxsbuwhuqbselcktpkpd.supabase.co")
SUPABASE_ANON_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c2J1d2h1cWJzZWxja3Rwa3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODExMDUsImV4cCI6MjA3ODE1NzEwNX0.qUy2yeBZ7UBBNKMJVxAFnMtlUqwP5wbm91DyoJQmHMs")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
