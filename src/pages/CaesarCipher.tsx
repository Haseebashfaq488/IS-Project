import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Typography,
  Box,
  TextField,
  Slider,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

type Step = {
  index: number;
  originalChar: string;
  originalCode: number;
  shiftedCode: number;
  newChar: string;
};

const CaesarCipher: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>("HELLO WORLD");
  const [key, setKey] = useState<number>(3);
  const [ciphertext, setCiphertext] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(800);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const cleanText: string = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  const steps: Step[] = [];

  for (let i = 0; i < cleanText.length; i++) {
    const originalChar = cleanText[i];
    const originalCode = originalChar.charCodeAt(0) - 65;
    const shift = mode === 'encrypt' ? key : -key;
    const shiftedCode = (originalCode + shift + 26) % 26;
    const newChar = String.fromCharCode(shiftedCode + 65);

    steps.push({
      index: i,
      originalChar,
      originalCode,
      shiftedCode,
      newChar,
    });
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isPlaying && currentStep < steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  useEffect(() => {
    const shift = mode === 'encrypt' ? key : -key;
    const encrypted = cleanText
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0) - 65;
        return String.fromCharCode(((code + shift + 26) % 26) + 65);
      })
      .join("");

    setCiphertext(encrypted);
  }, [plaintext, key, mode]);

  const reset = (): void => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const current: Step | Record<string, never> =
    steps[currentStep] || steps[steps.length - 1] || {};

  return (
    <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", pt: 8, pb: 12 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            component={motion.h1}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Caesar Cipher
          </Typography>

          <Typography variant="h6" color="text.secondary" mt={2}>
            Shift each letter by a fixed number — the oldest known substitution cipher
          </Typography>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }} gap={4} mb={8}>
          <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="#22d3ee">
                Introduction
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                Named after Julius Caesar, this monoalphabetic cipher shifts every letter in the plaintext by a fixed key value.
                It was used for military communication over 2000 years ago.
              </Typography>

              <Chip label="Formula: (x + k) mod 26" color="primary" sx={{ mt: 2 }} />
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: "#1f2937", border: "1px solid #374151" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="#22d3ee">
                Basic Steps
              </Typography>

              <Box component="ol" sx={{ pl: 3, color: "#d1d5db" }}>
                <li>Choose a shift key (1–25)</li>
                <li>For each letter, shift forward by the key positions</li>
                <li>Wrap around using modulo 26 (Z → A)</li>
                <li>Non-letters are usually removed</li>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 4,
            p: 4,
            mb: 6,
          }}
        >
          <Box display="flex" flexWrap="wrap" gap={4} alignItems="end">
            <TextField
              label="Plaintext"
              fullWidth
              value={plaintext}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPlaintext(e.target.value);
                reset();
              }}
              sx={{ flex: 1, minWidth: 280 }}
              InputProps={{ sx: { fontFamily: "monospace", fontSize: "1.1rem" } }}
            />

            <Box sx={{ width: 220 }}>
              <Typography gutterBottom>Shift Key (k)</Typography>

              <Box display="flex" alignItems="center" gap={3}>
                <Slider
                  value={key}
                  onChange={(_, val: number | number[]) => {
                    if (typeof val === "number") {
                      setKey(val);
                      reset();
                    }
                  }}
                  min={1}
                  max={25}
                  valueLabelDisplay="auto"
                  sx={{ color: "#22d3ee" }}
                />

                <Typography variant="h4" fontWeight="bold" color="#22d3ee" minWidth={40}>
                  {key}
                </Typography>
              </Box>
            </Box>

            <Box>
              <RadioGroup
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as 'encrypt' | 'decrypt');
                  reset();
                }}
                row
              >
                <FormControlLabel value="encrypt" control={<Radio />} label="Encrypt" />
                <FormControlLabel value="decrypt" control={<Radio />} label="Decrypt" />
              </RadioGroup>
            </Box>

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => setIsPlaying(!isPlaying)}
                sx={{
                  bgcolor: isPlaying ? "#ef4444" : "#10b981",
                  "&:hover": { bgcolor: isPlaying ? "#b91c1c" : "#059669" },
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                }}
              >
                {isPlaying ? "Pause" : "Play Animation"}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<RestartAltIcon />}
                onClick={reset}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          <Box mt={4} display="flex" alignItems="center" gap={3}>
            <Typography variant="body2" color="text.secondary">
              Animation Speed
            </Typography>

            <Slider
              value={speed}
              onChange={(_, val: number | number[]) => {
                if (typeof val === "number") setSpeed(val);
              }}
              min={200}
              max={1500}
              step={100}
              sx={{ flex: 1, color: "#22d3ee" }}
            />

            <Typography variant="body2" fontFamily="monospace" minWidth={60}>
              {speed} ms
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "#111827",
            border: "1px solid #374151",
            borderRadius: 6,
            p: 8,
            minHeight: 580,
          }}
        >
          <Typography variant="h5" textAlign="center" gutterBottom color="#22d3ee">
            Step-by-Step Visualization
          </Typography>

          <Box textAlign="center" mb={8}>
            <Typography variant="caption" color="text.secondary">
              {mode === 'encrypt' ? 'RESULTING CIPHERTEXT' : 'RESULTING PLAINTEXT'}
            </Typography>

            <Typography
              variant="h3"
              fontFamily="monospace"
              letterSpacing={4}
              color="#34d399"
              fontWeight="bold"
              mt={1}
            >
              {ciphertext || "—"}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={3} maxWidth="900px" mx="auto">
            <AnimatePresence mode="popLayout">
              {cleanText.split("").map((char, index) => {
                const isActive = index === currentStep;
                const isProcessed = index < currentStep;
                const stepData = steps[index];

                return (
                  <motion.div key={index} layout>
                    <Card
                      sx={{
                        bgcolor: isActive
                          ? "#164e63"
                          : isProcessed
                          ? "#14532d"
                          : "#1f2937",
                        border: "1px solid #475569",
                        height: 110,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h3" fontWeight="bold">
                        {isProcessed ? stepData.newChar : char}
                      </Typography>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CaesarCipher;