import os
from supabase import create_client
from dotenv import load_dotenv  # make sure python-dotenv is installed

# Load .env from the project root
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL ")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

