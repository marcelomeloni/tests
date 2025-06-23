
function initSupabase() {
const SUPABASE_URL = 'https://fhamhyolyolsirfxxhan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYW1oeW9seW9sc2lyZnh4aGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjAyMjIsImV4cCI6MjA2NTEzNjIyMn0.iQIDCKWVZpKlmbKXG60J-nUd5lK-S5Nw5GvDSqE_w1Y'; // Your full key


if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded!');
    return null;
  }

  try {
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
    return client;
  } catch (error) {
    console.error('Supabase init error:', error);
    return null;
  }
}

// Store in window after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.supabaseClient = initSupabase();
});