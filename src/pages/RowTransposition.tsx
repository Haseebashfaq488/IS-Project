import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Button, Paper, Card,
  RadioGroup, Radio, FormControlLabel, ThemeProvider, createTheme, Slider
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#fbbf24' }, secondary: { main: '#f97316' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

const RowTransposition: React.FC = () => {
  const [plaintext, setPlaintext] = useState("ATTACKPOSTPONEDUNTILTWOAM");
  const [keyword, setKeyword] = useState("4312567");
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [currentStep, setCurrentStep] = useState(0); // highlights a specific column based on read order
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const cleanText = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  let cleanKey = keyword.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleanKey) cleanKey = "KEY"; // fallback

  const len = cleanText.length;
  const cols = cleanKey.length;
  const rows = Math.ceil(len / cols);
  const remainder = len % cols;
  
  const colLengths = Array(cols).fill(rows);
  if (remainder > 0) {
    for (let i = remainder; i < cols; i++) colLengths[i] = rows - 1;
  }

  const sortedKey = cleanKey.split('').map((char, i) => ({ char, i })).sort((a, b) => a.char.localeCompare(b.char));
  const readOrder = sortedKey.map(k => k.i);

  const matrix: (string | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  
  if (mode === 'encrypt') {
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx < len) matrix[r][c] = cleanText[idx++];
      }
    }
  } else {
    // fill by columns according to readOrder
    let idx = 0;
    for (const c of readOrder) {
      for (let r = 0; r < colLengths[c]; r++) {
        if (idx < len) matrix[r][c] = cleanText[idx++];
      }
    }
  }

  // Generate output dynamically
  let output = "";
  if (mode === 'encrypt') {
      const processedCols = readOrder.slice(0, currentStep);
      for (const c of processedCols) {
        for (let r = 0; r < colLengths[c]; r++) {
          if (matrix[r][c]) output += matrix[r][c];
        }
      }
  } else {
      if (currentStep > 0) {
        for (let r = 0; r < Math.min(currentStep, rows); r++) {
          for (let c = 0; c < cols; c++) {
            if (matrix[r][c]) output += matrix[r][c];
          }
        }
      }
  }

  const maxSteps = mode === 'encrypt' ? cols : rows;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < maxSteps) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), speed);
    } else if (currentStep >= maxSteps) setIsPlaying(false);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, maxSteps]);

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" component={motion.h1} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #fbbf24, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Row Transposition
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>Transposes letters based on numerical or alphabetical keyword sort.</Typography>
          </Box>
          
          <Paper sx={{ bgcolor: "#1f2937", borderRadius: 4, p: 4, mb: 6, border: "1px solid #374151" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "end" }}>
              <TextField label="Keyword (Letters/Numbers)" value={keyword} onChange={e => { setKeyword(e.target.value); reset(); }} sx={{ width: 220 }} />
              <TextField label="Input Text" fullWidth value={plaintext} onChange={e => { setPlaintext(e.target.value); reset(); }} sx={{ flex: 1, minWidth: 280 }} />
              
              <RadioGroup value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} row>
                <FormControlLabel value="encrypt" control={<Radio sx={{color:"#fbbf24",'&.Mui-checked':{color:"#fbbf24"}}}/>} label="Encrypt" />
                <FormControlLabel value="decrypt" control={<Radio sx={{color:"#fbbf24",'&.Mui-checked':{color:"#fbbf24"}}}/>} label="Decrypt" />
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
              <Slider value={speed} onChange={(_, val: number | number[]) => { if (typeof val === "number") setSpeed(val); }} min={500} max={2500} step={100} sx={{ flex: 1, color: "#fbbf24" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60, color: "text.secondary" }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: "#111827", borderRadius: 6, p: 4, minHeight: 400, border: "1px solid #374151" }}>
             <Typography variant="h5" sx={{ color: "#fbbf24", textAlign: "center", mb: 4 }}>Transposition Grid</Typography>
             
             <Box sx={{ overflowX: 'auto', p: 2, textAlign: 'center' }}>
               <Box sx={{ display: "inline-grid", gridTemplateColumns: `repeat(${cols}, 60px)`, gap: 1, justifyItems: "center" }}>
                 {/* Key Headers */}
                 {cleanKey.split('').map((ch, cIdx) => {
                   const sortPosition = sortedKey.findIndex(k => k.i === cIdx);
                   return (
                     <Box key={`header-${cIdx}`} sx={{ mb: 1, textAlign: "center" }}>
                       <Typography variant="h6" sx={{ color: "#f97316", fontWeight: "bold" }}>{ch}</Typography>
                       <Typography variant="caption" sx={{ color: "text.secondary" }}>({sortPosition + 1})</Typography>
                     </Box>
                   )
                 })}
                 
                 {/* Grid Cells */}
                 {Array.from({length: rows}).map((_, rIdx) => 
                   Array.from({length: cols}).map((_, cIdx) => {
                     const isNode = matrix[rIdx][cIdx] !== null;
                     
                     let isActive = false;
                     let isDone = false;
                     if (mode === 'encrypt') {
                        const targetStepForCol = readOrder.findIndex(idx => idx === cIdx);
                        isActive = isPlaying && currentStep === targetStepForCol;
                        isDone = targetStepForCol < currentStep;
                     } else {
                        isActive = isPlaying && currentStep === rIdx;
                        isDone = rIdx < currentStep;
                     }

                     return (
                       <Box key={`${rIdx}-${cIdx}`} sx={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         {isNode && (
                           <motion.div animate={{ scale: isActive ? 1.15 : 1 }}>
                             <Card sx={{
                               width: 58, height: 58, display: "flex", alignItems: "center", justifyContent: "center",
                               bgcolor: isActive ? "#fbbf24" : isDone ? "#059669" : "#1f2937",
                               border: "1px solid #475569", borderRadius: 2
                             }}>
                               <Typography variant="h5" sx={{ fontWeight: "bold", color: isActive ? "#000" : "#f8fafc" }}>{matrix[rIdx][cIdx]}</Typography>
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
                 <Typography variant="h4" sx={{ textAlign: "center", color: "#14b8a6", fontFamily: "monospace", letterSpacing: 8, mt: 2 }}>
                   {output || "—"}
                 </Typography>
              </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
export default RowTransposition;