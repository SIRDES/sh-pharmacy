// "use client";
// import React from "react";
// import { SessionProvider } from "next-auth/react";

// export default function AuthContextProvider({ children }:{children:React.ReactNode}) {
//   return <SessionProvider>{children}</SessionProvider>;
// }



'use client'
import * as React from 'react'
// import {
//   ThemeProvider as NextThemesProvider,
//   type ThemeProviderProps,
// } from 'next-themes'
import { SessionProvider, SessionProviderProps } from "next-auth/react";
export function AuthContextProvider({ children, ...props }: SessionProviderProps) {
  return <SessionProvider {...props}>{children}</SessionProvider>
}

