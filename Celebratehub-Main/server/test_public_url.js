require('dotenv').config({ path: './.env' });
const supabase = require('./supabase.js');

async function testPublicUrl() {
  const filePath = `public/test-document-1773234610707.txt`; // The one we just uploaded
  
  console.log(`Getting public URL for: ${filePath}`);
  
  const { data } = supabase.storage
    .from('celebrate-doc')
    .getPublicUrl(filePath);

  console.log('Public URL:', data.publicUrl);
  
  // Try fetching it to see if it actually works
  try {
    const res = await fetch(data.publicUrl);
    console.log(`Fetch status: ${res.status}`);
    if (res.ok) {
        const text = await res.text();
        console.log(`File content: ${text}`);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testPublicUrl();
