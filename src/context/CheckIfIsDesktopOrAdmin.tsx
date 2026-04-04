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
import { useSession } from "next-auth/react";
import { USER_ROLES } from "@/types/constants";
import { useMediaQuery } from "@mui/material";
import theme from "@/theme/theme";


export function AuthContextProvider({ children, ...props }: SessionProviderProps) {

  const { data: session } = useSession();
  const currentUser = session?.user;
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return <SessionProvider {...props}>{children}</SessionProvider>
}

