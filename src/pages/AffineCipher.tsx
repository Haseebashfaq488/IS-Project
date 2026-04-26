import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Slider, Button, Paper, Card, CardContent,
  Chip, FormControlLabel, RadioGroup, Radio, Select, MenuItem, FormControl, InputLabel,
  ThemeProvider, createTheme
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#f59e0b' }, secondary: { main: '#ef4444' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

type Step = { index: number; originalChar: string; originalCode: number; shiftedCode: number; newChar: string; };
const COPRIMES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
const modInverse = (a: number, m: number): number => {
  for (let i = 1; i < m; i++) if ((a * i) % m === 1) return i;
  return 1;
};

const AffineCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>("HELLO WORLD");
  const [a, setA] = useState<number>(5);
  const [b, setB] = useState<number>(8);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(800);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const cleanText: string = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  const steps: Step[] = [];

  for (let i = 0; i < cleanText.length; i++) {
    const originalChar = cleanText[i];
    const originalCode = originalChar.charCodeAt(0) - 65;
    let shiftedCode = 0;
    
    if (mode === 'encrypt') {
      shiftedCode = (a * originalCode + b) % 26;
    } else {
      const aInv = modInverse(a, 26);
      shiftedCode = (aInv * (originalCode - b + 26)) % 26;
      while (shiftedCode < 0) shiftedCode += 26;
    }
    
    steps.push({ index: i, originalChar, originalCode, shiftedCode, newChar: String.fromCharCode(shiftedCode + 65) });
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < steps.length) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), speed);
    } else if (currentStep >= steps.length) setIsPlaying(false);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = (): void => { setCurrentStep(0); setIsPlaying(false); };
  const current: Step | Record<string, never> = steps[currentStep] || steps[steps.length - 1] || {};
  const isAct = currentStep < steps.length && isPlaying;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component={motion.h1} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Affine Cipher
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>
              A monoalphabetic substitution cipher combining multiplication and addition.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 4, mb: 8 }}>
            <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: "#f59e0b" }}>Introduction</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                  The Affine cipher maps each letter to its numeric equivalent, transforms it using a simple mathematical function `(a*x + b) mod 26`, and converts back into a letter. It is more secure than the Caesar cipher but still vulnerable to frequency analysis.
                </Typography>
                <Chip label="Encrypt: E(x) = (ax + b) mod 26" color="primary" sx={{ mt: 1, mr: 1, bgcolor: '#f59e0b', color: '#000', border: 'none' }} />
                <Chip label="Decrypt: D(x) = a⁻¹(x - b) mod 26" color="secondary" sx={{ mt: 1, bgcolor: '#ef4444', color: '#fff', border: 'none' }} />
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: "#f59e0b" }}>Basic Steps</Typography>
                <Box component="ol" sx={{ pl: 3, color: "#d1d5db" }}>
                  <li>Choose key <b>a</b> (must be coprime with 26)</li>
                  <li>Choose key <b>b</b> (0 to 25)</li>
                  <li>For each letter, multiply by <b>a</b> and add <b>b</b></li>
                  <li>Wrap around using modulo 26 (Z → A)</li>
                  <li>For decryption, calculate the modular inverse of <b>a</b>.</li>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Paper sx={{ bgcolor: "#1f2937", border: "1px solid #374151", borderRadius: 4, p: 4, mb: 6 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "end" }}>
              <TextField label="Input Text" fullWidth value={plaintext} onChange={(e) => { setPlaintext(e.target.value); reset(); }} sx={{ flex: 1, minWidth: 280 }} InputProps={{ sx: { fontFamily: "monospace", fontSize: "1.1rem" } }} />

              <Box sx={{ width: 120 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#f59e0b" }}>Key (a)</InputLabel>
                  <Select value={a} label="Key (a)" onChange={(e) => { setA(Number(e.target.value)); reset(); }} sx={{ color: "#f59e0b", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" } }}>
                    {COPRIMES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: 220 }}>
                <Typography gutterBottom sx={{ color: "text.secondary" }}>Shift Key (b): {b}</Typography>
                <Slider value={b} onChange={(_, val) => { if (typeof val === "number") { setB(val); reset(); } }} min={0} max={25} sx={{ color: "#f59e0b" }} />
              </Box>

              <Box>
                <RadioGroup value={mode} onChange={(e) => { setMode(e.target.value as 'encrypt' | 'decrypt'); reset(); }} row>
                  <FormControlLabel value="encrypt" control={<Radio sx={{ color: "#f59e0b", '&.Mui-checked': { color: "#f59e0b" } }} />} label="Encrypt" />
                  <FormControlLabel value="decrypt" control={<Radio sx={{ color: "#f59e0b", '&.Mui-checked': { color: "#f59e0b" } }} />} label="Decrypt" />
                </RadioGroup>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="contained" size="large" startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => setIsPlaying(!isPlaying)} sx={{ bgcolor: isPlaying ? "#ef4444" : "#10b981", "&:hover": { bgcolor: isPlaying ? "#b91c1c" : "#059669" }, px: 5, py: 1.5, borderRadius: 3, color: "#fff" }}>
                  {isPlaying ? "Pause" : "Play Animation"}
                </Button>
                <Button variant="outlined" size="large" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderRadius: 3, px: 4, color: "#fff", borderColor: "rgba(255,255,255,0.23)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}>
                  Reset
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Animation Speed</Typography>
              <Slider value={speed} onChange={(_, val) => { if (typeof val === "number") setSpeed(val); }} min={200} max={1500} step={100} sx={{ flex: 1, color: "#f59e0b" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60, color: "text.secondary" }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: "#111827", border: "1px solid #374151", borderRadius: 6, p: 8, minHeight: 580 }}>
            <Typography variant="h5" sx={{ textAlign: "center", mb: 4, color: "#f59e0b" }}>Step-by-Step Visualization</Typography>

            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}</Typography>
              <Typography variant="h4" sx={{ textAlign: "center", color: "#34d399", fontFamily: "monospace", letterSpacing: 4, mt: 1 }}>
                {steps.map(s => s.newChar).join("") || "—"}
              </Typography>
            </Box>
            
            <Box sx={{ minHeight: 60, mb: 4, textAlign: "center", borderBottom: "1px solid #374151", pb: 2 }}>
               <AnimatePresence mode="wait">
                 {isAct && current.originalChar && (
                   <motion.div key={current.index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                     <Typography variant="h6" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                        {mode === 'encrypt'
                          ? `${current.originalChar}(${current.originalCode})  ➔  (${a} × ${current.originalCode} + ${b}) mod 26 = ${current.shiftedCode} ➔ `
                          : `${current.originalChar}(${current.originalCode})  ➔  ${modInverse(a, 26)} × (${current.originalCode} - ${b}) mod 26 = ${current.shiftedCode} ➔ `
                        }
                        <span style={{color: "#34d399"}}>{current.newChar}</span>
                     </Typography>
                   </motion.div>
                 )}
               </AnimatePresence>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 3, maxWidth: 900, mx: "auto" }}>
              <AnimatePresence mode="popLayout">
                {cleanText.split("").map((char, index) => {
                  const isActive = index === currentStep;
                  const isProcessed = index < currentStep;
                  const stepData = steps[index];

                  return (
                    <motion.div key={index} layout>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: isActive ? "#f59e0b" : "text.secondary", fontWeight: "bold" }}>
                          {mode === 'encrypt' ? `×${a}+${b}` : `×${modInverse(a,26)}-${b}`}
                        </Typography>
                        <Card sx={{
                          bgcolor: isActive ? "#78350f" : isProcessed ? "#14532d" : "#1f2937",
                          border: "1px solid",
                          borderColor: isActive ? "#f59e0b" : "#475569",
                          height: 90, width: 70,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f8fafc" }}>
                            {isProcessed ? stepData.newChar : stepData.originalChar}
                          </Typography>
                        </Card>
                      </Box>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AffineCipher;