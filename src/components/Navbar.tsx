import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cipher Visualizer
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Link to="/home" style={{ textDecoration: 'none' }}><Button color="inherit">Home</Button></Link>
          <Link to="/monoalphabetic" style={{ textDecoration: 'none' }}><Button color="inherit">Monoalphabetic</Button></Link>
          <Link to="/caesar" style={{ textDecoration: 'none' }}><Button color="inherit">Caesar</Button></Link>
          <Link to="/affine" style={{ textDecoration: 'none' }}><Button color="inherit">Affine</Button></Link>
          <Link to="/polyalphabetic" style={{ textDecoration: 'none' }}><Button color="inherit">Polyalphabetic</Button></Link>
          <Link to="/playfair" style={{ textDecoration: 'none' }}><Button color="inherit">Playfair</Button></Link>
          <Link to="/hill" style={{ textDecoration: 'none' }}><Button color="inherit">Hill</Button></Link>
          <Link to="/vigenere" style={{ textDecoration: 'none' }}><Button color="inherit">Vigenere</Button></Link>
          <Link to="/railfence" style={{ textDecoration: 'none' }}><Button color="inherit">Rail Fence</Button></Link>
          <Link to="/rowtransposition" style={{ textDecoration: 'none' }}><Button color="inherit">Row Transposition</Button></Link>
          <Link to="/rotormachine" style={{ textDecoration: 'none' }}><Button color="inherit">Rotormachine</Button></Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;