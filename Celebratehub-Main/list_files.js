require('dotenv').config({ path: './Celebratehub-Main/server/.env' });
const supabase = require('./Celebratehub-Main/server/supabase.js');

async function listFiles() {
  const { data, error } = await supabase.storage.from('celebrate-doc').list();
  if (error) {
    console.error('Error fetching files:', error);
  } else {
    console.log('Files in celebrate-doc:', JSON.stringify(data, null, 2));
  }
}

listFiles();
