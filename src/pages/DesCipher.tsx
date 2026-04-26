import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container, Typography, Box, TextField, Slider, Button, Paper, Card, CardContent,
  Chip, ThemeProvider, createTheme
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#0a0a0a', paper: '#1f2937' }, primary: { main: '#c084fc' }, secondary: { main: '#a855f7' } },
  typography: { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }
});

// Feistel Simulation Helpers (Deterministic HEX XOR tracking for UI visualization)
const hashHex = (hex: string): string => {
  let hash = 0;
  for (let i = 0; i < hex.length; i++) {
    hash = (hash * 31 + hex.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
};

const xorHex = (hex1: string, hex2: string): string => {
  let result = "";
  for (let i = 0; i < 8; i++) {
    const val1 = parseInt(hex1[i] || "0", 16);
    const val2 = parseInt(hex2[i] || "0", 16);
    result += (val1 ^ val2).toString(16).toUpperCase();
  }
  return result;
};

// Simulation constraints
type DesStep = { index: number; Li: string; Ri: string; Ki: string; activeNodeIdx: number; subStage?: { name: string; visual: string; idx: number; }; };

const DesCipher: React.FC = () => {
  const [plaintextHex, setPlaintextHex] = useState<string>("0123456789ABCDEF");
  const [keyHex, setKeyHex] = useState<string>("133457799BBCDFF1");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1800);

  // Generate 16 Rounds Deterministically
  const steps: DesStep[] = [];
  let L = plaintextHex.slice(0, 8).padStart(8, '0');
  let R = plaintextHex.slice(8, 16).padStart(8, '0');
  
  // Node 0: IP
  steps.push({ index: 0, Li: hashHex(L), Ri: hashHex(R), Ki: "INITIAL PERMUTATION", activeNodeIdx: 1 });
  
  L = hashHex(L);
  R = hashHex(R);

  for (let i = 1; i <= 16; i++) {
    const subkey = hashHex(keyHex + i.toString()); // Simulated Key Scheduler
    const newL = R;
    
    const feistelOutput = hashHex(R + subkey); // Simulated E-Box, S-Box, P-Box
    const newR = xorHex(L, feistelOutput);
    
    if (i === 1) {
       // Detailed Sub-steps specifically requested for Round 1
       const expandedR = hashHex(R + "E"); 
       const mixed = xorHex(expandedR, subkey);
       const sBoxOut = hashHex(mixed);
       const pc1 = hashHex(keyHex + "PC1"); // Simulated 56-bit PC1
       const shifted = hashHex(pc1 + "SH"); // Simulated Shifted 56-bit Key halves
       
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "1. Key Permutation (PC-1)", visual: `PC1(Key) = ${pc1}`, idx: 1 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "2. Key Splitting & Left Shift", visual: `Shift(C₀, D₀) = ${shifted}`, idx: 2 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "3. Key Compression (PC-2)", visual: `PC2(${shifted}) = K₁`, idx: 3 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "4. Expansion (E-Box)", visual: `E(R₀) = ${expandedR}`, idx: 4 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "5. Key Mixing (XOR)", visual: `${expandedR} ⊕ K₁ = ${mixed}`, idx: 5 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "6. Substitution (S-box)", visual: `S-Box(${mixed}) = ${sBoxOut}`, idx: 6 } });
       steps.push({ index: i, Li: L, Ri: R, Ki: subkey, activeNodeIdx: 2, subStage: { name: "7. Permutation (P-box)", visual: `P-Box(${sBoxOut}) = ${feistelOutput}`, idx: 7 } });
       steps.push({ index: i, Li: newL, Ri: newR, Ki: subkey, activeNodeIdx: 2, subStage: { name: "8. L/R Output Assignment", visual: `R₁ = L₀ ⊕ F(R₀,K₁) = ${newR}`, idx: 8 } });
    } else {
       steps.push({ index: i, Li: newL, Ri: newR, Ki: subkey, activeNodeIdx: 1 + i }); 
    }
    
    L = newL;
    R = newR;
  }

  // Final 32-bit swap
  const swapL = R;
  const swapR = L;
  steps.push({ index: 17, Li: swapL, Ri: swapR, Ki: "32-BIT SWAP", activeNodeIdx: 18 });

  // Node 18: Final Permutation (IP-1)
  const finalL = hashHex(swapL);
  const finalR = hashHex(swapR);
  steps.push({ index: 18, Li: finalL, Ri: finalR, Ki: "FINAL PERMUTATION (IP⁻¹)", activeNodeIdx: 19 });

  const activeData = steps[currentStep] || steps[0];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), speed);
    } else if (currentStep >= steps.length - 1) setIsPlaying(false);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };

  const ovalStyle = (isActive: boolean) => ({
      borderRadius: "50%",
      border: isActive ? "3px solid #c084fc" : "2px solid #475569",
      bgcolor: isActive ? "#581c87" : "#1e293b",
      color: isActive ? "#f8fafc" : "#94a3b8",
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: 50, minWidth: 150, px: 3, py: 1,
      fontWeight: "bold", textAlign: "center" as const,
      boxShadow: isActive ? "0 0 20px rgba(192, 132, 252, 0.4)" : "none",
      transition: "all 0.3s ease"
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component={motion.h1} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} sx={{ fontWeight: 700, background: "linear-gradient(90deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Data Encryption Standard (DES)
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>
              Symmetric-key Feistel algorithm tracking massive 16-round 64-bit structural networks.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 4 }}>
            
            {/* Left Box: Graphic Diagram Flowchart */}
            <Paper sx={{ bgcolor: "#111827", border: "1px solid #374151", borderRadius: 6, p: 4 }}>
                <Typography variant="h5" sx={{ textAlign: "center", mb: 4, color: "#c084fc", fontWeight: "bold" }}>
                    Overall Vector Structure
                </Typography>
                
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                   {/* Node 0: Plaintext */}
                   <Box sx={ovalStyle(currentStep === 0)}>Plaintext (64-bit)</Box>
                   <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                   
                   {/* Node 1: IP */}
                   <Box sx={ovalStyle(activeData.activeNodeIdx === 1)}>Initial Permutation (IP)</Box>
                   <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>

                   {/* Nodes 2-17: Rounds 1 to 16 */}
                   {Array.from({length: 16}).map((_, i) => (
                      <React.Fragment key={i}>
                         {i === 0 ? (
                            <Box sx={{ border: "1px dashed #475569", p: 2, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, my: 1, width: "100%", bgcolor: "rgba(15, 23, 42, 0.4)" }}>
                               <Typography variant="overline" sx={{ color: "#c084fc", fontWeight: "bold" }}>Round 1 Detailed Steps</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 1)}>Key Permutation (PC-1)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 2)}>Key Shift (C, D)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 3)}>Key Compression (PC-2)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>

                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 4)}>Expansion (E-Box)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 5)}>Key Mixing (XOR)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 6)}>Substitution (S-Box)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 7)}>Permutation (P-Box)</Box>
                               <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                               
                               <Box sx={ovalStyle(activeData.index === 1 && activeData.subStage?.idx === 8)}>L/R Assignment</Box>
                            </Box>
                         ) : (
                            <Box sx={ovalStyle(activeData.activeNodeIdx === i + 2)}>Round {i + 1}</Box>
                         )}
                         <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>
                      </React.Fragment>
                   ))}

                   {/* Node 18: Swap */}
                   <Box sx={ovalStyle(activeData.activeNodeIdx === 18)}>32-bit Swap</Box>
                   <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>

                   {/* Node 19: IP Inverse */}
                   <Box sx={ovalStyle(activeData.activeNodeIdx === 19)}>Final Permutation (IP⁻¹)</Box>
                   <Typography sx={{ color: "#475569", fontWeight: "bold", my: 0 }}>↓</Typography>

                   <Box sx={ovalStyle(currentStep === steps.length - 1)}>Ciphertext (64-bit)</Box>
                </Box>
            </Paper>


            {/* Right Box: Interactive Execution */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
               <Paper sx={{ bgcolor: "#1f2937", border: "1px solid #374151", borderRadius: 4, p: 4 }}>
                 <Typography variant="h6" sx={{ color: "#c084fc", mb: 3 }}>Input Constraints</Typography>
                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                   <TextField label="Plaintext (16 Hex Chars)" fullWidth value={plaintextHex} onChange={(e) => { setPlaintextHex(e.target.value.toUpperCase()); reset(); }} InputProps={{ sx: { fontFamily: "monospace", letterSpacing: 2 } }} sx={{ flex: 1, minWidth: 280 }} />
                   <TextField label="Encryption Key (16 Hex Chars)" fullWidth value={keyHex} onChange={(e) => { setKeyHex(e.target.value.toUpperCase()); reset(); }} InputProps={{ sx: { fontFamily: "monospace", letterSpacing: 2 } }} sx={{ flex: 1, minWidth: 280 }} />
                 </Box>

                 <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, mt: 4 }}>
                    <Button variant="contained" size="large" startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => setIsPlaying(!isPlaying)} sx={{ bgcolor: isPlaying ? "#ef4444" : "#c084fc", color: "#fff", px: 5, py: 1.5, borderRadius: 3, "&:hover": { bgcolor: isPlaying ? "#b91c1c" : "#a855f7" } }}>
                      {isPlaying ? "Pause" : "Simulate Process"}
                    </Button>
                    <Button variant="outlined" size="large" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderRadius: 3, px: 4, color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>Reset</Button>

                    <Box sx={{ flex: 1, minWidth: 150, display: "flex", alignItems: "center", gap: 2 }}>
                       <Typography variant="body2" sx={{ color: "text.secondary" }}>Speed</Typography>
                       <Slider value={speed} onChange={(_, val) => setSpeed(val as number)} min={200} max={3000} step={200} sx={{ color: "#c084fc" }} />
                    </Box>
                 </Box>
               </Paper>

               <Paper sx={{ bgcolor: "#0f172a", border: "1px dashed #334155", borderRadius: 6, p: 6, minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <Typography variant="h5" sx={{ textAlign: "center", mb: 6, color: "#c084fc", fontWeight: "bold" }}><AutoAwesomeIcon sx={{ verticalAlign: "middle", mr: 1 }}/> Calculation Step Sequence Engine</Typography>
                   
                   <AnimatePresence mode="wait">
                       <motion.div key={currentStep} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                           
                           {/* Step Label Tracker */}
                           <Box sx={{ textAlign: "center", mb: 4 }}>
                               <Chip label={
                                  activeData.activeNodeIdx === 1 ? "INITIALIZING IP MATRIX" : 
                                  activeData.activeNodeIdx >= 2 && activeData.activeNodeIdx <= 17 ? `EXECUTING FEISTEL ROUND ${activeData.index}` : 
                                  activeData.activeNodeIdx === 18 ? "SWAPPING L & R VECTORS" : "FINAL COMPILATION"
                               } sx={{ bgcolor: "#c084fc", color: "#000", fontWeight: "bold", px: 2, py: 2.5, fontSize: "1.1rem" }} />
                           </Box>

                           {/* Left and Right 32-bit registers */}
                           <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                               <Card sx={{ bgcolor: "#1e293b", border: "1px solid #475569", p: 3, textAlign: "center" }}>
                                   <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold" }}>Left Vector (32-bit)</Typography>
                                   <Typography variant="h3" sx={{ mt: 2, fontFamily: "monospace", color: "#60a5fa", letterSpacing: 4 }}>
                                       {activeData.Li}
                                   </Typography>
                               </Card>
                               <Card sx={{ bgcolor: "#1e293b", border: "1px solid #475569", p: 3, textAlign: "center" }}>
                                   <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold" }}>Right Vector (32-bit)</Typography>
                                   <Typography variant="h3" sx={{ mt: 2, fontFamily: "monospace", color: "#34d399", letterSpacing: 4 }}>
                                       {activeData.Ri}
                                   </Typography>
                               </Card>
                           </Box>

                           {/* Feistel Subkey Traces */}
                           {activeData.activeNodeIdx >= 2 && activeData.activeNodeIdx <= 17 && (
                               <Card sx={{ mt: 4, bgcolor: "#2d1637", border: "1px solid #c084fc", p: 3, textAlign: "center", minHeight: 180 }}>
                                   <Typography variant="caption" sx={{ color: "#e879f9", fontWeight: "bold", display: "block", mb: 1 }}>
                                       {activeData.subStage ? `Round 1 Detailed Breakdown: ${activeData.subStage.name}` : "Feistel Round Engine Execution"}
                                   </Typography>
                                   
                                   {activeData.subStage ? (
                                       <Box sx={{ mt: 2 }}>
                                           <Typography variant="h5" sx={{ fontFamily: "monospace", color: "#34d399", fontWeight: "bold" }}>
                                               {activeData.subStage.visual}
                                           </Typography>
                                       </Box>
                                   ) : (
                                       <Box>
                                           <Typography variant="h6" sx={{ mt: 2, fontFamily: "monospace", color: "#f8fafc" }}>
                                                L<sub>{activeData.index}</sub> = R<sub>{activeData.index-1}</sub> = {activeData.Li}
                                           </Typography>
                                           <Typography variant="h6" sx={{ mt: 1, fontFamily: "monospace", color: "#f8fafc" }}>
                                                R<sub>{activeData.index}</sub> = L<sub>{activeData.index-1}</sub> ⊕ F(R<sub>{activeData.index-1}</sub>, K<sub>{activeData.index}</sub>) = {activeData.Ri}
                                           </Typography>
                                       </Box>
                                   )}
                                   <Chip label={`Subkey Generated: ${activeData.Ki}`} sx={{ mt: 2, bgcolor: "rgba(192, 132, 252, 0.2)", color: "#e879f9" }} />
                               </Card>
                           )}

                       </motion.div>
                   </AnimatePresence>
               </Paper>
            </Box>

          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default DesCipher;
