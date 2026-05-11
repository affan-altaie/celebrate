import React from 'react';

const SocialLinks = () => {
  return (
    <div style={{ padding: '10px' }}>
      <p>Here are our social media profiles:</p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ margin: '5px 0' }}><a href="https://www.facebook.com/share/1RpFVMEQ4g/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        <li style={{ margin: '5px 0' }}><a href="https://x.com/celebratehub1?s=11&t=qUydlJmpYkwu5EazB_QN2Q" target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>
        <li style={{ margin: '5px 0' }}><a href="https://www.instagram.com/celebrate.hub1?igsh=aTRyemExbDRyeWVs&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a></li>
      </ul>
    </div>
  );
};

export default SocialLinks;
