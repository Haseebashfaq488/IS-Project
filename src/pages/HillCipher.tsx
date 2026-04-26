import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Slider, Button, Paper, Card, CardContent,
  Chip, FormControlLabel, RadioGroup, Radio, ThemeProvider, createTheme, Alert,
  FormControl, Select, MenuItem, InputLabel
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#a3e635' }, secondary: { main: '#bef264' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

const mod = (n: number, m: number) => ((n % m) + m) % m;
const modInverse = (a: number, m: number) => {
  a = mod(a, m);
  for (let x = 1; x < m; x++) if (mod(a * x, m) === 1) return x;
  return -1;
};

// Math utilities for Modulo 26 operations
const getDeterminant = (matrix: number[][], N: number): number => {
  if (N === 1) return matrix[0][0];
  if (N === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  let det = 0;
  for (let c = 0; c < N; c++) {
    const subMatrix = [];
    for (let r = 1; r < N; r++) {
      const row = [];
      for (let j = 0; j < N; j++) {
        if (j !== c) row.push(matrix[r][j]);
      }
      subMatrix.push(row);
    }
    const sign = c % 2 === 0 ? 1 : -1;
    det += sign * matrix[0][c] * getDeterminant(subMatrix, N - 1);
  }
  return mod(det, 26);
};

const getCofactor = (matrix: number[][], N: number, r: number, c: number) => {
  const subMatrix = [];
  for (let i = 0; i < N; i++) {
    if (i === r) continue;
    const row = [];
    for (let j = 0; j < N; j++) {
      if (j === c) continue;
      row.push(matrix[i][j]);
    }
    subMatrix.push(row);
  }
  const sign = (r + c) % 2 === 0 ? 1 : -1;
  return sign * getDeterminant(subMatrix, N - 1);
};

const getAdjugate = (matrix: number[][], N: number) => {
  if (N === 1) return [[1]];
  const adj = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      adj[j][i] = mod(getCofactor(matrix, N, i, j), 26);
    }
  }
  return adj;
};

const getInverseMatrix = (matrix: number[][], N: number, invDet: number) => {
  const adj = getAdjugate(matrix, N);
  const inv = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      inv[i][j] = mod(adj[i][j] * invDet, 26);
    }
  }
  return inv;
};

// Math utilities for Standard Calculator Reals (Decimals)
const getRawDeterminant = (matrix: number[][], N: number): number => {
  if (N === 1) return matrix[0][0];
  if (N === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  let det = 0;
  for (let c = 0; c < N; c++) {
    const subMatrix = [];
    for (let r = 1; r < N; r++) {
      const row = [];
      for (let j = 0; j < N; j++) {
        if (j !== c) row.push(matrix[r][j]);
      }
      subMatrix.push(row);
    }
    const sign = c % 2 === 0 ? 1 : -1;
    det += sign * matrix[0][c] * getRawDeterminant(subMatrix, N - 1);
  }
  return det;
};

const getRawCofactor = (matrix: number[][], N: number, r: number, c: number) => {
  const subMatrix = [];
  for (let i = 0; i < N; i++) {
    if (i === r) continue;
    const row = [];
    for (let j = 0; j < N; j++) {
      if (j === c) continue;
      row.push(matrix[i][j]);
    }
    subMatrix.push(row);
  }
  const sign = (r + c) % 2 === 0 ? 1 : -1;
  return sign * getRawDeterminant(subMatrix, N - 1);
};

const getRawAdjugate = (matrix: number[][], N: number) => {
  if (N === 1) return [[1]];
  const adj = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      adj[j][i] = getRawCofactor(matrix, N, i, j);
    }
  }
  return adj;
};

type Step = { index: number; ptChars: string[]; ctChars: string[]; ptCodes: number[]; ctCodes: number[]; };

const DEFAULT_KEYS: Record<number, number[]> = {
  2: [3, 3, 2, 5],
  3: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  4: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
};

const HillCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>("HELP WORLD XYZ");
  const [dim, setDim] = useState<number>(2);
  const [keys, setKeys] = useState<number[]>([...DEFAULT_KEYS[2]]);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1200);

  const cleanText = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  let pt = cleanText;
  while (pt.length % dim !== 0) pt += "X"; 
  
  const matrix2D = Array(dim).fill(null).map((_, r) => keys.slice(r * dim, r * dim + dim));
  let det = getDeterminant(matrix2D, dim);
  const invDet = modInverse(det, 26);
  const isInvertible = invDet !== -1;

  let calcMatrix = matrix2D;
  let normalInverse: number[][] = [];
  
  if (mode === 'decrypt' && isInvertible) {
    calcMatrix = getInverseMatrix(matrix2D, dim, invDet);
    
    // Compute normal calculator inverse for the display feature
    const rawDet = getRawDeterminant(matrix2D, dim);
    if (rawDet !== 0) {
       const rawAdj = getRawAdjugate(matrix2D, dim);
       normalInverse = Array(dim).fill(null).map(() => Array(dim).fill(0));
       for (let i = 0; i < dim; i++) {
         for (let j = 0; j < dim; j++) {
           normalInverse[i][j] = rawAdj[i][j] / rawDet;
         }
       }
    }
  }

  const steps: Step[] = [];
  if (mode === 'encrypt' || isInvertible) {
    for (let i = 0; i < pt.length; i += dim) {
      if (i + (dim - 1) >= pt.length) break;
      
      const ptBlockCodes = [];
      const ptBlockChars = [];
      for(let j=0; j<dim; j++) {
          ptBlockChars.push(pt[i+j]);
          ptBlockCodes.push(pt.charCodeAt(i+j) - 65);
      }

      const ctBlockCodes = new Array(dim).fill(0);
      const ctBlockChars = new Array(dim).fill('');
      
      for (let r = 0; r < dim; r++) {
        let sum = 0;
        for (let c = 0; c < dim; c++) {
          sum += calcMatrix[r][c] * ptBlockCodes[c];
        }
        ctBlockCodes[r] = mod(sum, 26);
        ctBlockChars[r] = String.fromCharCode(ctBlockCodes[r] + 65);
      }

      steps.push({
        index: i / dim,
        ptChars: ptBlockChars, ptCodes: ptBlockCodes,
        ctChars: ctBlockChars, ctCodes: ctBlockCodes
      });
    }
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < steps.length) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), speed);
    } else if (currentStep >= steps.length) setIsPlaying(false);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };
  const current = steps[currentStep] || steps[steps.length - 1] || {} as Step;
  const isAct = currentStep < steps.length && isPlaying;

  const handleDimChange = (val: number) => {
      setDim(val);
      setKeys([...DEFAULT_KEYS[val]]);
      reset();
  };

  const handleKeyChange = (index: number, val: string) => {
      let v = parseInt(val);
      if (isNaN(v)) v = 0;
      const newKeys = [...keys];
      newKeys[index] = v;
      setKeys(newKeys);
      reset();
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component={motion.h1} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #a3e635, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Hill Cipher
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>
              A polygraphic substitution cipher relying on Linear Algebra and Matrices up to 4x4.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 4, mb: 8 }}>
            <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: "#a3e635" }}>Introduction</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                  Invented in 1929, the Hill Cipher computes entire blocks of letters simultaneously. By multiplying linear matrices representing target blocks against a Key Matrix, frequency analysis is hidden efficiently!
                </Typography>
                <Chip label={`Formula: C = (K * P) mod 26`} color="primary" sx={{ mt: 2, bgcolor: "#a3e635", color: "#000" }} />
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: "#a3e635" }}>Mathematical Operations (NxN)</Typography>
                <Box component="ol" sx={{ pl: 3, color: "#d1d5db" }}>
                  <li>Format text mathematically into Block Vectors length N</li>
                  <li>Identify a numeric N-dimension Key Matrix (Determinant MUST be Coprime to 26!)</li>
                  <li>Perform cross multiplication row by column solving algorithms</li>
                  <li>Decrypt via finding the Inverse Key Matrix natively.</li>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Paper sx={{ bgcolor: "#1f2937", border: "1px solid #374151", borderRadius: 4, p: 4, mb: 6 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "flex-start" }}>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl sx={{ minWidth: 140 }}>
                   <InputLabel sx={{ color: "#a3e635" }}>Dimension</InputLabel>
                   <Select value={dim} label="Dimension" onChange={e => handleDimChange(Number(e.target.value))}
                           sx={{ color: "#a3e635", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" } }}>
                      <MenuItem value={2}>2x2 Matrix</MenuItem>
                      <MenuItem value={3}>3x3 Matrix</MenuItem>
                      <MenuItem value={4}>4x4 Matrix</MenuItem>
                   </Select>
                </FormControl>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" sx={{ color: "#a3e635", textAlign: "center" }}>Key Matrix inputs</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${dim}, 1fr)`, gap: 1, bgcolor: "#0f172a", p: 1, borderRadius: 2, border: "1px solid #334155" }}>
                    {Array.from({ length: dim * dim }).map((_, i) => (
                      <TextField key={i} type="number" sx={{ width: 60 }} inputProps={{ style: { textAlign: 'center', color: '#a3e635', fontWeight: 'bold' } }} value={keys[i]} onChange={e => handleKeyChange(i, e.target.value)} />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="Input Text" fullWidth value={plaintext} onChange={(e) => { setPlaintext(e.target.value); reset(); }} InputProps={{ sx: { fontFamily: "monospace", fontSize: "1.1rem" } }} />
                {!isInvertible && (
                   <Alert severity="error" sx={{ bgcolor: "rgba(220, 38, 38, 0.1)", color: "#fca5a5" }}>
                     Warning: The current Matrix determinant {det} is not coprime with 26. (Not Invertible! Decryption will fail).
                   </Alert>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <RadioGroup value={mode} onChange={(e) => { setMode(e.target.value as 'encrypt' | 'decrypt'); reset(); }} row sx={{ mb: isInvertible ? 0 : 5 }}>
                  <FormControlLabel value="encrypt" control={<Radio sx={{color:"#a3e635",'&.Mui-checked':{color:"#a3e635"}}} />} label="Encrypt" />
                  <FormControlLabel value="decrypt" control={<Radio sx={{color:"#a3e635",'&.Mui-checked':{color:"#a3e635"}}} />} label="Decrypt" />
                </RadioGroup>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <Button variant="contained" size="large" startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => setIsPlaying(!isPlaying)} disabled={mode === 'decrypt' && !isInvertible} sx={{ bgcolor: isPlaying ? "#ef4444" : "#10b981", px: 5, py: 1.5, borderRadius: 3, color: "#fff", "&:hover": { bgcolor: isPlaying ? "#b91c1c" : "#059669" } }}>
                  {isPlaying ? "Pause" : "Play Animation"}
                </Button>
                <Button variant="outlined" size="large" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderRadius: 3, px: 4, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>Reset</Button>
              </Box>

            </Box>

            <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Animation Speed</Typography>
              <Slider value={speed} onChange={(_, val) => { if (typeof val === "number") setSpeed(val); }} min={500} max={2500} step={100} sx={{ flex: 1, color: "#a3e635" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60 }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: "#111827", border: "1px solid #374151", borderRadius: 6, p: 8, minHeight: 500 }}>
            
            {/* Decryption Mode Matrix Tracking feature as requested! */}
            {mode === 'decrypt' && isInvertible && normalInverse.length > 0 && (
              <Box sx={{ mb: 6, p: 3, bgcolor: "#0f172a", borderRadius: 3, border: "1px dashed #334155" }}>
                  <Typography variant="h6" sx={{ color: "#a3e635", mb: 2, textAlign: "center" }}>Inverse Matrix Transformation</Typography>
                  <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                      <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>1. Normal Calculator Inverse (Decimals)</Typography>
                          <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${dim}, 1fr)`, gap: 1 }}>
                              {normalInverse.flat().map((val, idx) => (
                                  <Box key={idx} sx={{ bgcolor: "#1e293b", p: 1, borderRadius: 1, border: "1px solid #475569", minWidth: 65, fontFamily: "monospace" }}>
                                      {val.toFixed(2)}
                                  </Box>
                              ))}
                          </Box>
                      </Box>
                      <Box sx={{ textAlign: "center", display: "flex", alignItems: "center" }}>
                          <Typography variant="h4" sx={{ color: "#64748b" }}>➔</Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>2. Proper Modulo 26 Integers</Typography>
                          <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: `repeat(${dim}, 1fr)`, gap: 1 }}>
                              {calcMatrix.flat().map((val, idx) => (
                                  <Box key={idx} sx={{ bgcolor: "#3f6212", p: 1, borderRadius: 1, border: "1px solid #a3e635", minWidth: 65, fontFamily: "monospace", color: "#f8fafc" }}>
                                      {val}
                                  </Box>
                              ))}
                          </Box>
                      </Box>
                  </Box>
              </Box>
            )}

            <Typography variant="h5" sx={{ textAlign: "center", mb: 4, color: "#a3e635" }}>Step-by-Step {mode === 'decrypt' ? 'Decryption' : 'Matrix'} Process</Typography>

            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}</Typography>
                <Typography variant="h4" sx={{ textAlign: "center", color: "#34d399", fontFamily: "monospace", letterSpacing: 4, mt: 1 }}>
                  {steps.map(s => s.ctChars.join("")).join("") || "—"}
                </Typography>
            </Box>
            
            <Box sx={{ minHeight: 120, mb: 4, display: "flex", justifyContent: "center", borderBottom: "1px solid #374151", pb: 2 }}>
               <AnimatePresence mode="wait">
                 {isAct && current.ptChars && (
                   <motion.div key={current.index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                     <Typography variant="h6" sx={{ color: "#94a3b8", fontFamily: "monospace", textAlign: "left" }}>
                         Block [{current.ptChars.join('')}] ➔ <br/>
                         {Array.from({ length: dim }).map((_, rIdx) => (
                            <span key={rIdx}>
                              [ {Array.from({ length: dim }).map((_, cIdx) => `(${calcMatrix[rIdx][cIdx]} × ${current.ptCodes[cIdx]})`).join(' + ')} ] mod 26 = {current.ctCodes[rIdx]} ➔ <span style={{color: "#34d399"}}>{current.ctChars[rIdx]}</span> <br/>
                            </span>
                         ))}
                     </Typography>
                   </motion.div>
                 )}
               </AnimatePresence>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 3, maxWidth: 900, mx: "auto" }}>
              <AnimatePresence mode="popLayout">
                {steps.map((stepData, index) => {
                  const isActive = index === currentStep;
                  const isProcessed = index < currentStep;

                  return (
                    <motion.div key={index} layout>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: isActive ? "#a3e635" : "text.secondary", fontWeight: "bold" }}>
                          Block {index + 1}
                        </Typography>
                        <Card sx={{
                          bgcolor: isActive ? "#3f6212" : isProcessed ? "#14532d" : "#1f2937",
                          border: "1px solid",
                          borderColor: isActive ? "#a3e635" : "#475569",
                          minHeight: 90, minWidth: 90, p: 2,
                          display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 4
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: "bold", color: "#f8fafc" }}>
                            {isProcessed ? stepData.ctChars.join('') : stepData.ptChars.join('')}
                          </Typography>
                        </Card>
                      </Box>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default HillCipher;