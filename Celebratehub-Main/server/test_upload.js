require('dotenv').config({ path: './.env' });
const supabase = require('./supabase.js');

async function testUploadAndUrl() {
  const fileContent = "This is a test document in the public folder.";
  const filePath = `public/test-document-${Date.now()}.txt`;
  
  console.log(`Attempting to upload to: ${filePath}`);
  
  const { data, error } = await supabase.storage
    .from('celebrate-doc')
    .upload(filePath, fileContent, {
      contentType: 'text/plain',
      upsert: false
    });

  if (error) {
    console.error('Upload failed with error:', error);
    return;
  }
  
  console.log('Upload successful:', data);
    
  console.log('Generating signed URL for the file we just uploaded...');
  const { data: urlData, error: urlError } = await supabase.storage
    .from('celebrate-doc')
    .createSignedUrl(filePath, 60 * 60);

  if (urlError) {
    console.error('Failed to create signed URL:', urlError);
  } else {
    console.log('Signed URL generated successfully:', urlData);
  }
}

testUploadAndUrl();
