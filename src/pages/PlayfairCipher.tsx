import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Slider, Button, Paper, Card, CardContent,
  Chip, FormControlLabel, RadioGroup, Radio, ThemeProvider, createTheme
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#a855f7' }, secondary: { main: '#ec4899' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

type Point = { r: number; c: number };
type Step = { index: number; p1: Point; p2: Point; c1: string; c2: string; n1: Point; n2: Point; new1: string; new2: string; rule: string };

const PlayfairCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState("HELLO WORLD");
  const [keyword, setKeyword] = useState("KEYWORD");
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // Generate Matrix
  const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  const matrix: string[][] = Array(5).fill(null).map(() => Array(5).fill(""));
  const used = new Set<string>();
  let r = 0, c = 0;
  
  const addChar = (ch: string) => {
    if (!used.has(ch)) {
      used.add(ch);
      matrix[r][c] = ch;
      c++;
      if (c === 5) { c = 0; r++; }
    }
  };
  
  for (const ch of cleanKey) addChar(ch);
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    if (ch !== 'J') addChar(ch);
  }

  const findPos = (ch: string): Point => {
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++)
        if (matrix[i][j] === ch) return { r: i, c: j };
    return { r: 0, c: 0 };
  };

  // Prepare text
  let pt = plaintext.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  if (mode === 'encrypt') {
    let temp = "";
    for (let i = 0; i < pt.length; i++) {
      temp += pt[i];
      if (i + 1 < pt.length && pt[i] === pt[i+1]) temp += "X";
    }
    if (temp.length % 2 !== 0) temp += "X";
    pt = temp;
  }

  // Process pairs
  const steps: Step[] = [];
  for (let i = 0; i < pt.length; i += 2) {
    if (i + 1 >= pt.length) break;
    const c1 = pt[i];
    const c2 = pt[i+1];
    const p1 = findPos(c1);
    const p2 = findPos(c2);
    let n1 = { ...p1 }, n2 = { ...p2 }, rule = "";
    
    if (p1.r === p2.r) {
      rule = "Same Row: Shift " + (mode === 'encrypt' ? "Right" : "Left");
      n1.c = mode === 'encrypt' ? (p1.c + 1) % 5 : (p1.c + 4) % 5;
      n2.c = mode === 'encrypt' ? (p2.c + 1) % 5 : (p2.c + 4) % 5;
    } else if (p1.c === p2.c) {
      rule = "Same Column: Shift " + (mode === 'encrypt' ? "Down" : "Up");
      n1.r = mode === 'encrypt' ? (p1.r + 1) % 5 : (p1.r + 4) % 5;
      n2.r = mode === 'encrypt' ? (p2.r + 1) % 5 : (p2.r + 4) % 5;
    } else {
      rule = "Rectangle: Swap Columns";
      n1.c = p2.c;
      n2.c = p1.c;
    }
    
    steps.push({ index: i/2, p1, p2, c1, c2, n1, n2, new1: matrix[n1.r][n1.c], new2: matrix[n2.r][n2.c], rule });
  }

  // Animation logic
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
            <Typography variant="h2" component={motion.h1} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Playfair Cipher
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>Encrypts pairs of letters in a dynamic 5x5 matrix.</Typography>
          </Box>
          
          <Paper sx={{ bgcolor: "#1f2937", borderRadius: 4, p: 4, mb: 6, border: "1px solid #374151" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "end" }}>
              <TextField label="Keyword" value={keyword} onChange={e => { setKeyword(e.target.value); reset(); }} sx={{ width: 220 }} />
              <TextField label="Input Text" fullWidth value={plaintext} onChange={e => { setPlaintext(e.target.value); reset(); }} sx={{ flex: 1, minWidth: 280 }} />
              
              <RadioGroup value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} row>
                <FormControlLabel value="encrypt" control={<Radio sx={{color:"#a855f7",'&.Mui-checked':{color:"#a855f7"}}}/>} label="Encrypt" />
                <FormControlLabel value="decrypt" control={<Radio sx={{color:"#a855f7",'&.Mui-checked':{color:"#a855f7"}}}/>} label="Decrypt" />
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
              <Slider value={speed} onChange={(_, val: number | number[]) => { if (typeof val === "number") setSpeed(val); }} min={500} max={2500} step={100} sx={{ flex: 1, color: "#a855f7" }} />
              <Typography variant="body2" sx={{ fontFamily: "monospace", minWidth: 60, color: "text.secondary" }}>{speed} ms</Typography>
            </Box>
          </Paper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 4 }}>
            <Paper sx={{ bgcolor: "#111827", borderRadius: 6, p: 4, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid #374151" }}>
              <Typography variant="h5" sx={{ color: "#a855f7", mb: 4 }}>5x5 Matrix</Typography>
              <Box sx={{ display: "inline-grid", gridTemplateColumns: { xs: "repeat(5, 40px)", sm: "repeat(5, 50px)" }, gap: 1, justifyItems: "center" }}>
                {matrix.map((row, rIdx) => row.map((cell, cIdx) => {
                  const isActiveOld = current.p1 && ((current.p1.r === rIdx && current.p1.c === cIdx) || (current.p2.r === rIdx && current.p2.c === cIdx));
                  const isActiveNew = current.n1 && ((current.n1.r === rIdx && current.n1.c === cIdx) || (current.n2.r === rIdx && current.n2.c === cIdx));
                  
                  let bgColor = "#1f2937";
                  if (isActiveOld && isActiveNew) bgColor = "#eab308"; // Overlap
                  else if (isActiveOld) bgColor = "#7c3aed";
                  else if (isActiveNew) bgColor = "#059669";
                  else bgColor = "#1f2937";

                  return (
                    <motion.div key={`${rIdx}-${cIdx}`} animate={{ scale: (isActiveOld || isActiveNew) && isAct ? 1.15 : 1 }}>
                      <Card sx={{ 
                        width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 }, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: bgColor, border: "1px solid #374151",
                        transition: 'background-color 0.3s ease'
                      }}>
                        <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: "bold" }}>{cell}</Typography>
                      </Card>
                    </motion.div>
                  )
                }))}
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mt: 4 }}>
                <Chip label="Original Pair" sx={{ bgcolor: "#7c3aed", color: "#fff" }} />
                <Chip label="Mapped Pair" sx={{ bgcolor: "#059669", color: "#fff" }} />
              </Box>
            </Paper>

            <Paper sx={{ bgcolor: "#111827", borderRadius: 6, p: 4, minHeight: 400, border: "1px solid #374151" }}>
              <Typography variant="h5" sx={{ color: "#a855f7", textAlign: "center", mb: 2 }}>Step-by-Step Visualization</Typography>
              
              <Box sx={{ textAlign: "center", mb: 6 }}>
                 <Typography variant="caption" sx={{ color: "text.secondary" }}>{mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}</Typography>
                 <Typography variant="h4" sx={{ textAlign: "center", color: "#34d399", fontFamily: "monospace", letterSpacing: 4, mt: 1 }}>
                   {steps.map(s => s.new1 + s.new2).join(" ") || "—"}
                 </Typography>
              </Box>
              
              <Box sx={{ minHeight: 60, mb: 4, textAlign: "center", borderBottom: "1px solid #374151", pb: 2 }}>
                <AnimatePresence mode="wait">
                  {isAct && current.c1 && (
                    <motion.div key={current.index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                      <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                        Rule <span style={{color: "#a855f7", fontWeight: "bold"}}>[ {current.rule} ]</span>
                        <br/>
                        Pairs: {current.c1}{current.c2} ➔ <span style={{color: "#34d399"}}>{current.new1}{current.new2}</span>
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {steps.map((step, idx) => {
                  const active = idx === currentStep;
                  const done = idx < currentStep;
                  return (
                    <Card key={idx} sx={{
                      width: 70, height: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      bgcolor: active ? "#831843" : done ? "#14532d" : "#1f2937",
                      border: "1px solid #475569"
                    }}>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>{active || !done ? "—" : `${step.c1}${step.c2}`}</Typography>
                      <Typography variant="h5" sx={{ color: "#f8fafc", fontWeight: "bold" }}>{done ? `${step.new1}${step.new2}` : `${step.c1}${step.c2}`}</Typography>
                    </Card>
                  )
                })}
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PlayfairCipher;