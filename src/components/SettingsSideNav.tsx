"use client";

import {
  Box,
  BoxProps,
  Icon,
  List,
  ListItem,
  Tab,
  Tabs,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CircleNotificationsOutlinedIcon from "@mui/icons-material/CircleNotificationsOutlined";
const StyledNavItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "20px",

  // height:"290px",

  transition: "ease-in-out 0.6s",
  // justifyContent: "center",
  "&:hover": {
    color: "#fff",
    // cursor: "pointer",
    borderLeft: "5px solid #4698CA",
    backgroundColor: "#2A4576",
  },
}));

export const MobileNav = () => {
  const pathname = usePathname();
  return (
    <Box
      className="settings-mobile-nav"
      sx={{
        display: { xs: "flex", md: "none" },
        justifyContent: "center",
        mb: 4,
      }}
    >
      <Box
        component={Link}
        className={`${pathname === "/settings/myAccount" && "active"}`}
        href="/settings/myAccount"
      >
        <AccountCircleOutlinedIcon />
        <Typography fontSize={"14px"}>My Account</Typography>
      </Box>
      <Box
        component={Link}
        className={`${pathname === "/settings/notifications" && "active"}`}
        href="/settings/notifications"
      >
        <CircleNotificationsOutlinedIcon />
        <Typography fontSize={"14px"}>Notifications</Typography>
      </Box>
    </Box>
  );
};

export default function SettingsSideNav() {
  const theme = useTheme();
  // const [value, setValue] = React.useState(0);
  const pathname = usePathname();
  // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setValue(newValue);
  // };
  const sideNavWidth = "230px";
  return (
    <>
      <Box
        sx={{
          // backgroundColor: theme.palette.primary.main,
          width: sideNavWidth,
          minHeight: "100%",
          // position: "fixed",
          // border: "1px solid #E7E9EE",
          display: { xs: "none", md: "block" },
        }}
      >
        <Box className={"settings-side-nav"}>
        <Box
        component={Link}
        className={`${pathname === "/settings/myAccount" && "active"}`}
        href="/settings/myAccount"
      >
        <AccountCircleOutlinedIcon />
        <Typography fontSize={"14px"}>My Account</Typography>
      </Box>
      <Box
        component={Link}
        className={`${pathname === "/settings/notifications" && "active"}`}
        href="/settings/notifications"
      >
        <CircleNotificationsOutlinedIcon />
        <Typography fontSize={"14px"}>Notifications</Typography>
      </Box>
        </Box>
      </Box>
    </>
  );
}
