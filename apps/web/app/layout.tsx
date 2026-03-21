import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeProvider';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LayoutWrapper } from './components/LayoutWrapper';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookify",
  description: "Your premium e-reader platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-200`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            
            {/* Toaster gets themed dynamically but defaults smoothly */}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                className: 'shadow-2xl font-medium bg-card border border-border text-foreground rounded-xl'
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
