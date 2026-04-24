import React from 'react';

const MonoalphabeticSubstitution: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Monoalphabetic Substitution</h1>
      <p>Introduction: A monoalphabetic substitution cipher replaces each letter with another letter using a fixed mapping.</p>
      <h2>Basic Steps</h2>
      <ol>
        <li>Create a substitution alphabet.</li>
        <li>Replace each plaintext letter with the corresponding cipher letter.</li>
        <li>Decrypt using the reverse mapping.</li>
      </ol>
      <h2>Step-by-Step Process</h2>
      <div style={{ height: '400px', border: '1px solid black', padding: '10px' }}>
        Visualizer will be implemented here.
      </div>
    </div>
  );
};

export default MonoalphabeticSubstitution;