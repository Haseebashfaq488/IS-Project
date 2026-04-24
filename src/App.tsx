import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MonoalphabeticSubstitution from './pages/MonoalphabeticSubstitution';
import CaesarCipher from './pages/CaesarCipher';
import AffineCipher from './pages/AffineCipher';
import PolyalphabeticSubstitution from './pages/PolyalphabeticSubstitution';
import PlayfairCipher from './pages/PlayfairCipher';
import HillCipher from './pages/HillCipher';
import VigenereCipher from './pages/VigenereCipher';
import RailFence from './pages/RailFence';
import RowTransposition from './pages/RowTransposition';
import Rotormachine from './pages/Rotormachine';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/monoalphabetic" element={<MonoalphabeticSubstitution />} />
          <Route path="/caesar" element={<CaesarCipher />} />
          <Route path="/affine" element={<AffineCipher />} />
          <Route path="/polyalphabetic" element={<PolyalphabeticSubstitution />} />
          <Route path="/playfair" element={<PlayfairCipher />} />
          <Route path="/hill" element={<HillCipher />} />
          <Route path="/vigenere" element={<VigenereCipher />} />
          <Route path="/railfence" element={<RailFence />} />
          <Route path="/rowtransposition" element={<RowTransposition />} />
          <Route path="/rotormachine" element={<Rotormachine />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
