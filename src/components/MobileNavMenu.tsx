"use client";

import * as React from "react";
import { styled, alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

import { signOut } from "next-auth/react";

import Link from "next/link";

import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useScrollTrigger,
} from "@mui/material";
import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from '@mui/icons-material/Menu';
interface Props {
  children: React.ReactElement;
}

function ElevationScroll(props: Props) {
  const { children } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children as React.ReactElement<{ elevation?: number }>, {
    elevation: trigger ? 4 : 0,
  });
}

export default function MobileNavMenu({
  navLists,
}: {
  navLists: { id: number; name: string; href: string }[];
}) {
  const theme = useTheme();
  const router = useRouter();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    React.useState<boolean>(false);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };
  const handleSignOut = () => {
    handleMobileMenuClose();
    signOut();
  };

  return (
    <>
      <ElevationScroll>
        <AppBar
          color="transparent"
          position="sticky"
          sx={{
            backgroundColor: "#FAFAFA",
            display: {
              xs: "flex",
              md: "none",
            },
          }}
        >
          <Toolbar>
            <Typography sx={{ flexGrow: 1 }} variant="h6" color={"primary"}>SNHT-SHOP</Typography>
            <Box
              sx={{
                // justifyContent: "flex-end",
                padding: "10px 0px",
              }}
            >
              <IconButton onClick={handleMobileMenuOpen}>
                <MenuIcon />
              </IconButton>
              {/* <FontAwesomeIcon
                icon={faBars}
                onClick={handleMobileMenuOpen}
                style={{
                  // marginRight: "30px",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              /> */}
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Drawer
        anchor="top"
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      >
        <Box
          sx={{
            display: isMobileMenuOpen ? "flex" : "none",
            flexDirection: "column",
            position: "fixed",
            gap: "10px",
            top: 0,
            right: 0,
            left: 0,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            padding: "10px 0px",
            boxShadow: "0px 1px 6px 0px #D0CDE1",
            // transition: "ease-in-out",
            "&>a": {
              color: "#fff",
              textDecoration: "none",
              padding: "10px 20px",
              fontSize: "14px",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
            <Typography variant="h6" color={"white"}>SNHT-SHOP</Typography>
            <IconButton onClick={handleMobileMenuClose}>
              <CloseIcon sx={{ color: "#fff" }} />
            </IconButton>
      
          </Box>
          {navLists.map((nav) => (
            <Link href={nav.href} key={nav.id} onClick={handleMobileMenuClose}>
              {nav.name}
            </Link>
          ))}
          <Button onClick={handleSignOut} color="inherit">
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
