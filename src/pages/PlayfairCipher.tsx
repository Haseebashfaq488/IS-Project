import React from 'react';

const PlayfairCipher: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Playfair Cipher</h1>
      <p>Introduction: The Playfair cipher is a manual symmetric encryption technique and was the first literal digram substitution cipher. It encrypts pairs of letters instead of single letters.</p>
      <h2>Basic Steps</h2>
      <ol>
        <li>Create a 5x5 key square using the keyword.</li>
        <li>Prepare the plaintext by pairing letters, inserting X if needed.</li>
        <li>For each pair, apply the encryption rules based on their positions in the square.</li>
        <li>Decrypt by reversing the process.</li>
      </ol>
      <h2>Step-by-Step Process</h2>
      <div style={{ height: '400px', border: '1px solid black', padding: '10px' }}>
        Visualizer will be implemented here.
      </div>
    </div>
  );
};

export default PlayfairCipher;