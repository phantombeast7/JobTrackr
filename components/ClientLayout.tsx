'use client'

import { usePathname } from 'next/navigation'
import { Box } from "@mui/material"
import Navigation from './Navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 7, sm: 0 } }}>
      {children}
      {!isHomePage && <Navigation />}
    </Box>
  );
} 