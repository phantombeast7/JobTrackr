import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Box } from "@mui/material";
import { AuthProvider } from '@/context/AuthContext'
import ClientLayout from '../components/ClientLayout'
import { SchedulerInitializer } from '@/components/SchedulerInitializer'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JobTrackr",
  description: "Track your job applications efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientLayout>
            <SchedulerInitializer />
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
