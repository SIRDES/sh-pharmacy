import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CssBaseline from "@mui/material/CssBaseline";
// import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@mui/material";

import theme from "@/theme/theme";
import { ShopsContextProvider } from "@/context/ShopsContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AuthContextProvider } from "@/context/AuthContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "SH-PHARMACY",
  description: "Stevhans pharmacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
        <AuthContextProvider>
          <ThemeProvider theme={theme}>
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}
            <ShopsContextProvider>
              <CssBaseline />
              {children}
            </ShopsContextProvider>
            {/* </LocalizationProvider> */}
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
