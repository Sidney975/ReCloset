import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh" // Full viewport height
        textAlign="center"
      >
        <Typography variant="h3" component="h1">
          Welcome to ReCloset
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
