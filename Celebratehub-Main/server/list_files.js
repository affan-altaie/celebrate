require('dotenv').config({ path: './.env' });
const supabase = require('./supabase.js');

async function listFiles() {
  const { data, error } = await supabase.storage.from('celebrate-doc').list('public');
  if (error) {
    console.error('Error fetching files:', error);
  } else {
    console.log('Files in celebrate-doc/public:', JSON.stringify(data, null, 2));
  }
}

listFiles();
