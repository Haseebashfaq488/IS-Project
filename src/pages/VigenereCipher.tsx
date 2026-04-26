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
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#a855f7' }, secondary: { main: '#06b6d4' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

type Step = { index: number; ptChar: string; ptCode: number; kwChar: string; kwCode: number; newChar: string; newCode: number };

const VigenereCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState("HELLOWORLD");
  const [keyword, setKeyword] = useState("KEY");
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  const cleanText = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  let cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanKey) cleanKey = "A";

  const steps: Step[] = [];
  for (let i = 0; i < cleanText.length; i++) {
    const ptChar = cleanText[i];
    const kwChar = cleanKey[i % cleanKey.length];
    const ptCode = ptChar.charCodeAt(0) - 65;
    const kwCode = kwChar.charCodeAt(0) - 65;
    
    let newCode = 0;
    if (mode === 'encrypt') {
      newCode = (ptCode + kwCode) % 26;
    } else {
      newCode = (ptCode - kwCode + 26) % 26;
    }
    
    steps.push({
      index: i, ptChar, ptCode, kwChar, kwCode, newCode, newChar: String.fromCharCode(newCode + 65)
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
  const current = steps[currentStep] || steps[steps.length - 1] || {} as Step;
  const isAct = currentStep < steps.length && isPlaying;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h2" component={motion.h1} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Vigenère Cipher
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>Encrypts text by mapping corresponding alphabet shifts based on a repeating keyword.</Typography>
          </Box>

          <Paper sx={{ bgcolor: "#1f2937", borderRadius: 4, p: 4, mb: 6, border: "1px solid #374151" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "end" }}>
              <TextField label="Keyword" value={keyword} onChange={e => { setKeyword(e.target.value); reset(); }} sx={{ width: 220 }} />
              <TextField label="Input Text" fullWidth value={plaintext} onChange={e => { setPlaintext(e.target.value); reset(); }} sx={{ flex: 1, minWidth: 280 }} />
              
              <RadioGroup value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} row>
                <FormControlLabel value="encrypt" control={<Radio sx={{color:"#06b6d4",'&.Mui-checked':{color:"#06b6d4"}}}/>} label="Encrypt" />
                <FormControlLabel value="decrypt" control={<Radio sx={{color:"#06b6d4",'&.Mui-checked':{color:"#06b6d4"}}}/>} label="Decrypt" />
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
              <Slider value={speed} onChange={(_, val: number | number[]) => { if (typeof val === "number") setSpeed(val); }} min={200} max={1500} step={100} sx={{ flex: 1, color: "#06b6d4" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60, color: "text.secondary" }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: "#111827", borderRadius: 6, p: 4, minHeight: 400, border: "1px solid #374151" }}>
             <Typography variant="h5" sx={{ color: "#a855f7", textAlign: "center", mb: 4 }}>Step-by-Step Visualization</Typography>

             <Box sx={{ textAlign: "center", mb: 6 }}>
                 <Typography variant="caption" sx={{ color: "text.secondary" }}>{mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}</Typography>
                 <Typography variant="h4" sx={{ textAlign: "center", color: "#34d399", fontFamily: "monospace", letterSpacing: 4, mt: 1 }}>
                   {steps.map(s => s.newChar).join("") || "—"}
                 </Typography>
             </Box>
             
             <Box sx={{ minHeight: 60, mb: 4, textAlign: "center", borderBottom: "1px solid #374151", pb: 2 }}>
                <AnimatePresence mode="wait">
                  {isAct && current.ptChar && (
                    <motion.div key={current.index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                      <Typography variant="h6" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                         {mode === 'encrypt'
                           ? `${current.ptChar}(${current.ptCode}) + ${current.kwChar}(${current.kwCode}) mod 26 = ${current.newCode} ➔ `
                           : `${current.ptChar}(${current.ptCode}) - ${current.kwChar}(${current.kwCode}) mod 26 = ${current.newCode} ➔ `
                         }
                         <span style={{color: "#34d399"}}>{current.newChar}</span>
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
             </Box>

             <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 3, maxWidth: 900, mx: "auto" }}>
               <AnimatePresence mode="popLayout">
                 {cleanText.split("").map((_, index) => {
                   const isActive = index === currentStep;
                   const isProcessed = index < currentStep;
                   const stepData = steps[index];

                   return (
                     <motion.div key={index} layout>
                       <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                         <Typography variant="caption" sx={{ color: isActive ? "#06b6d4" : "text.secondary", fontWeight: "bold" }}>
                           {stepData.kwChar}
                         </Typography>
                         <Card sx={{
                           bgcolor: isActive ? "#581c87" : isProcessed ? "#14532d" : "#1f2937",
                           border: "1px solid",
                           borderColor: isActive ? "#a855f7" : "#475569",
                           height: 90, width: 70,
                           display: "flex", alignItems: "center", justifyContent: "center"
                         }}>
                           <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f8fafc" }}>
                             {isProcessed ? stepData.newChar : stepData.ptChar}
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
export default VigenereCipher;