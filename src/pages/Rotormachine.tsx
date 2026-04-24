import React from 'react';

const Rotormachine: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Rotor Machine</h1>
      <p>Introduction: Rotor machines are electro-mechanical encryption devices that use rotors to encrypt messages, famously used in the Enigma machine.</p>
      <h2>Basic Steps</h2>
      <ol>
        <li>Set up the rotors with initial positions.</li>
        <li>For each letter, pass through the rotors.</li>
        <li>Rotors advance after each key press.</li>
        <li>Decrypt by reversing the process with the same settings.</li>
      </ol>
      <h2>Step-by-Step Process</h2>
      <div style={{ height: '400px', border: '1px solid black', padding: '10px' }}>
        Visualizer will be implemented here.
      </div>
    </div>
  );
};

export default Rotormachine;