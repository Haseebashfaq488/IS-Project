import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Slider, Button, Paper, Card,
  RadioGroup, Radio, FormControlLabel, ThemeProvider, createTheme
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#3b82f6' }, secondary: { main: '#14b8a6' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

type Step = { index: number; r: number; c: number; char: string };

const RailFence: React.FC = () => {
  const [plaintext, setPlaintext] = useState("HELLOWORLD");
  const [rails, setRails] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const cleanText = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  const len = cleanText.length;
  
  const matrix: (string | null)[][] = Array(rails).fill(null).map(() => Array(len).fill(null));
  
  // Zigzag path calculation
  const path: {r: number, c: number}[] = [];
  if (len > 0) {
    let r = 0;
    let dir = 1;
    for (let c = 0; c < len; c++) {
      path.push({r, c});
      if (rails > 1) {
        if (r === 0) dir = 1;
        else if (r === rails - 1) dir = -1;
        r += dir;
      }
    }
  }

  const steps: Step[] = [];
  if (mode === 'encrypt') {
    path.forEach((p, i) => { matrix[p.r][p.c] = cleanText[i]; });
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      for (let c = 0; c < len; c++) {
        if (matrix[r][c] !== null) {
          steps.push({ index: idx++, r, c, char: matrix[r][c] as string });
        }
      }
    }
  } else {
    // Fill row by row
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      for (let c = 0; c < len; c++) {
        const isInPath = path.some(p => p.r === r && p.c === c);
        if (isInPath && idx < len) {
          matrix[r][c] = cleanText[idx++];
        }
      }
    }
    // Read zigzag
    path.forEach((p, i) => {
      steps.push({ index: i, r: p.r, c: p.c, char: matrix[p.r][p.c] as string });
    });
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < steps.length) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), speed);
    } else if (currentStep >= steps.length) setIsPlaying(false);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };
  const getProcessedCipher = () => steps.slice(0, currentStep).map(s => s.char).join("");

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" component={motion.h1} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #3b82f6, #14b8a6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rail Fence Cipher
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>A transposition cipher that reads in a zigzag pattern across multiple rails.</Typography>
          </Box>
          
          <Paper sx={{ bgcolor: "#1f2937", borderRadius: 4, p: 4, mb: 6, border: "1px solid #374151" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "end" }}>
              <TextField label="Input Text" fullWidth value={plaintext} onChange={e => { setPlaintext(e.target.value); reset(); }} sx={{ flex: 1, minWidth: 280 }} />
              
              <Box sx={{ width: 220 }}>
                <Typography gutterBottom sx={{ color: "text.secondary" }}>Rails (Depth): {rails}</Typography>
                <Slider value={rails} onChange={(_, val: number | number[]) => { if(typeof val === 'number') { setRails(val); reset(); } }} min={2} max={10} sx={{ color: "#3b82f6" }} />
              </Box>

              <RadioGroup value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} row>
                <FormControlLabel value="encrypt" control={<Radio sx={{color:"#3b82f6",'&.Mui-checked':{color:"#3b82f6"}}}/>} label="Encrypt" />
                <FormControlLabel value="decrypt" control={<Radio sx={{color:"#3b82f6",'&.Mui-checked':{color:"#3b82f6"}}}/>} label="Decrypt" />
              </RadioGroup>

              <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="contained" onClick={() => setIsPlaying(!isPlaying)} startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />} sx={{ bgcolor: isPlaying ? "#ef4444" : "#10b981", px: 4, py: 1.5, borderRadius: 3, color: '#fff' }}>
                    {isPlaying ? "Pause" : "Play Animation"}
                  </Button>
                  <Button variant="outlined" onClick={reset} startIcon={<RestartAltIcon />} sx={{ borderRadius: 3, px: 3, borderColor: "rgba(255,255,255,0.2)", color: '#fff' }}>Reset</Button>
              </Box>
            </Box>
            <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Animation Speed</Typography>
              <Slider value={speed} onChange={(_, val: number | number[]) => { if (typeof val === "number") setSpeed(val); }} min={200} max={1500} step={100} sx={{ flex: 1, color: "#3b82f6" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60, color: "text.secondary" }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: "#111827", borderRadius: 6, p: 4, minHeight: 400, border: "1px solid #374151" }}>
             <Typography variant="h5" sx={{ color: "#3b82f6", textAlign: "center", mb: 4 }}>Zigzag Visualization</Typography>
             
             <Box sx={{ overflowX: 'auto', p: 2 }}>
               <Box sx={{ display: "inline-grid", gridTemplateColumns: `repeat(${len}, 40px)`, gap: 1, justifyItems: "center" }}>
                 {Array.from({length: rails}).map((_, rIdx) => 
                   Array.from({length: len}).map((_, cIdx) => {
                     const isNode = matrix[rIdx][cIdx] !== null;
                     const stepMatch = steps.findIndex(s => s.r === rIdx && s.c === cIdx);
                     const isActive = isPlaying && stepMatch === currentStep;
                     const isDone = stepMatch < currentStep;

                     return (
                       <Box key={`${rIdx}-${cIdx}`} sx={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         {isNode && (
                           <motion.div animate={{ scale: isActive ? 1.2 : 1 }}>
                             <Card sx={{
                               width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                               bgcolor: isActive ? "#3b82f6" : isDone ? "#059669" : "#1f2937",
                               border: "1px solid #475569", borderRadius: "50%"
                             }}>
                               <Typography variant="h6" sx={{ fontWeight: "bold", color: "#f8fafc" }}>{matrix[rIdx][cIdx]}</Typography>
                             </Card>
                           </motion.div>
                         )}
                       </Box>
                     )
                   })
                 )}
               </Box>
             </Box>

             <Box sx={{ textAlign: "center", mt: 6, pt: 4, borderTop: "1px solid #374151" }}>
                 <Typography variant="caption" sx={{ color: "text.secondary" }}>{mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}</Typography>
                 <Typography variant="h3" sx={{ textAlign: "center", color: "#14b8a6", fontFamily: "monospace", letterSpacing: 8, mt: 2 }}>
                   {getProcessedCipher() || "—"}
                 </Typography>
              </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
export default RailFence;