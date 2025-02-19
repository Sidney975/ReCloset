import React from 'react';
import { Box, Typography, Button, Container, Grid, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#8d6238',
          // Replace with your actual image URL or local asset
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'White',
        }}
      >
        {/* Optional overlay for better text contrast */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Hero text and button */}
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
            SPRING DRESS COLLECTION
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/womens-clothing"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            SHOP NOW
          </Button>
        </Box>
      </Box>


      {/* Additional content below hero */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Welcome to ReCloset
        </Typography>
        <Typography variant="body1" paragraph>
          ReCloset is an online-based thrift store designed to source second-hand clothes from users worldwide, with manned drop points and storage locations where customers can donate their items. Staff at these locations evaluate the clothes, inputting the information into the platform. High-quality clothes are sold directly, while lower-quality donations are upcycled to reduce waste. ReCloset handles shipping from these storage locations to buyers, promoting a sustainable model of fashion consumption. By addressing textile waste, supporting ethical fashion, and pursuing a triple bottom line approach (People, Planet, and Profit), ReCloset seeks to combat the negative impact of fast fashion while maintaining profitability.
        </Typography>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <Typography variant="h5" sx={{ mb: 2 }}>
          Our Features
        </Typography>
        {/* Navigation Buttons */}
        <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/product/men">
              Men's Clothing
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/product/women">
              Women's Clothing
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/FashionConsultant">
              Fashion Consultant
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ mt: 3, mb: 3 }} />
      {/* "Random Bullshit" / Typical Clothing Company Filler */}
      <Box sx={{ py: 4, backgroundColor: '#f9f9f9' }}>
        <Container>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Our Commitment
          </Typography>
          <Typography variant="body1" paragraph>
            At ReCloset, we believe in the synergy of style and sustainability.
            By choosing us, you’re joining a movement to reduce waste and make
            fashion a more responsible industry.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            We’ve Got You Covered
          </Typography>
          <Typography variant="body1" paragraph>
            Not sure about your size? Need help styling a look?
            Our dedicated customer service team and fashion consultants
            are here to help you every step of the way.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Returns & Exchanges
          </Typography>
          <Typography variant="body1" paragraph>
            Changed your mind? No worries! We offer hassle-free returns and
            exchanges within 30 days. Simply contact our support team or
            check out our Returns page for more info.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Follow Us
          </Typography>
          <Typography variant="body1">
            Stay in the loop by following us on Instagram, Facebook, and Twitter
            for daily style inspiration, behind-the-scenes peeks, and special
            promotions.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;