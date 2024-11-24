"use client";

import { Box, Typography } from '@mui/material';

export default function Header() {
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 999
      }}
    >
      <Typography 
        variant="h5" 
        component="h1" 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main'
        }}
      >
        JobTrackr
      </Typography>
    </Box>
  );
} 