import React from 'react';

const RowTransposition: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Row Transposition Cipher</h1>
      <p>Introduction: The Row Transposition cipher is a type of transposition cipher where the plaintext is written in rows and read in columns according to a key.</p>
      <h2>Basic Steps</h2>
      <ol>
        <li>Choose a key (e.g., numbers for column order).</li>
        <li>Write the plaintext in rows under the key letters.</li>
        <li>Read the columns in the order specified by the key.</li>
        <li>Decrypt by writing in columns and reading in rows.</li>
      </ol>
      <h2>Step-by-Step Process</h2>
      <div style={{ height: '400px', border: '1px solid black', padding: '10px' }}>
        Visualizer will be implemented here.
      </div>
    </div>
  );
};

export default RowTransposition;