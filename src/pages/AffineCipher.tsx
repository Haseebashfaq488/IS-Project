import React, { useState } from 'react';
import { TextField, Button, Typography, Box, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { motion } from 'framer-motion';

const AffineCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState('');
  const [a, setA] = useState(5);
  const [b, setB] = useState(8);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<string[]>([]);

  const modInverse = (a: number, m: number): number => {
    for (let i = 1; i < m; i++) {
      if ((a * i) % m === 1) return i;
    }
    return -1;
  };

  const process = () => {
    const aVal = a;
    const bVal = b;
    const newSteps: string[] = [];
    let output = '';
    const m = 26;

    if (mode === 'encrypt') {
      if (modInverse(aVal, m) === -1) {
        alert('a must be coprime with 26');
        return;
      }
      for (let char of plaintext) {
        if (char.match(/[a-z]/i)) {
          const upper = char === char.toUpperCase();
          const base = upper ? 65 : 97;
          const x = char.charCodeAt(0) - base;
          const calc = (aVal * x + bVal) % m;
          const newChar = String.fromCharCode(calc + base);
          output += newChar;
          newSteps.push(`${char} (${x}) -> (${aVal}*${x} + ${bVal}) mod ${m} = ${calc} -> ${newChar}`);
        } else {
          output += char;
          newSteps.push(`${char} -> ${char} (unchanged)`);
        }
      }
    } else {
      const aInv = modInverse(aVal, m);
      if (aInv === -1) {
        alert('a has no inverse');
        return;
      }
      for (let char of plaintext) {
        if (char.match(/[a-z]/i)) {
          const upper = char === char.toUpperCase();
          const base = upper ? 65 : 97;
          const y = char.charCodeAt(0) - base;
          const calc = (aInv * (y - bVal + m)) % m;
          const newChar = String.fromCharCode(calc + base);
          output += newChar;
          newSteps.push(`${char} (${y}) -> ${aInv}*(${y} - ${bVal}) mod ${m} = ${calc} -> ${newChar}`);
        } else {
          output += char;
          newSteps.push(`${char} -> ${char} (unchanged)`);
        }
      }
    }

    setResult(output);
    setSteps(newSteps);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Affine Cipher</h1>
      <p>Introduction: The Affine cipher is a type of monoalphabetic substitution cipher, wherein each letter in an alphabet is mapped to its numeric equivalent, encrypted using a simple mathematical function, and converted back to a letter.</p>
      <h2>Basic Steps</h2>
      <ol>
        <li>Choose keys a and b, where a and 26 are coprime.</li>
        <li>For each letter, convert to number (A=0, B=1, ...).</li>
        <li>Apply the formula: (a * x + b) mod 26.</li>
        <li>Convert back to letter.</li>
        <li>Decrypt using the inverse.</li>
      </ol>
      <h2>Step-by-Step Process</h2>
      <Box sx={{ height: '400px', border: '1px solid black', padding: '10px', overflowY: 'auto' }}>
        <TextField
          label="Text"
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="a (must be coprime with 26)"
          type="number"
          value={a}
          onChange={(e) => setA(parseInt(e.target.value) || 1)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="b"
          type="number"
          value={b}
          onChange={(e) => setB(parseInt(e.target.value) || 0)}
          fullWidth
          margin="normal"
        />
        <RadioGroup
          value={mode}
          onChange={(e) => setMode(e.target.value as 'encrypt' | 'decrypt')}
          row
        >
          <FormControlLabel value="encrypt" control={<Radio />} label="Encrypt" />
          <FormControlLabel value="decrypt" control={<Radio />} label="Decrypt" />
        </RadioGroup>
        <Button variant="contained" onClick={process} sx={{ mt: 2 }}>
          {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </Button>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Result: {result}
            </Typography>
          </motion.div>
        )}
        {steps.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Steps:</Typography>
            <motion.ul variants={containerVariants} initial="hidden" animate="visible">
              {steps.map((step, index) => (
                <motion.li key={index} variants={itemVariants}>
                  {step}
                </motion.li>
              ))}
            </motion.ul>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default AffineCipher;