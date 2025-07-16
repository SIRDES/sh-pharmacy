"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Popover,
  List,
  ListItemButton,
  ListItemIcon,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  // useMediaQuery,
} from "@mui/material";
import Person2Icon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyIcon from "@mui/icons-material/Key";
// import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import LoadingAlert from "./LoadingAlert";
// import { useSidebar } from "@/context/SideBarContext";

const PageHeader = ({ text }: { text: string }) => {
  // const isMobile = useMediaQuery("(max-width:600px)");
  // const { toggleOpenSidebarOnMobile } = useSidebar();
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const router = useRouter();
  const handleLogout = async () => {
    try {
      handleClose();
      setLoading(true);
      await signOut();
    } catch (error: any) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <LoadingAlert open={loading} />
      <Box
        px={{ xs: 1, sm: 2, md: 3 }}
        sx={{
          pt: "0px",
          pb: "0px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* {isMobile && (
            <IconButton onClick={toggleOpenSidebarOnMobile}>
              <MenuIcon />
            </IconButton>
          )} */}
          {/* <Typography variant="h6">{text}</Typography> */}
        </Box>
        <Box display={"flex"} alignItems={"center"} gap={"5px"}>
          <Typography variant="body1">
            {session?.user?.username}
          </Typography>
          <IconButton onClick={handleClick}>
            {anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </IconButton>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            slotProps={{ paper: { sx: { width: "240px" } } }}
            elevation={1}
          >
            <List sx={{ padding: "0rem" }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    router.push("/profile");
                    handleClose();
                  }}
                  sx={{
                    padding: "0.2rem 1rem",
                    backgroundColor: "#f5f5f5",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: "30px" }}>
                    <Person2Icon sx={{ color: "#3f51b5", fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleClose();
                    router.push("/change-password")
                  }}
                  sx={{
                    padding: "0.2rem 1rem",
                    backgroundColor: "#f5f5f5",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: "30px" }}>
                    <KeyIcon sx={{ fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Change Password" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                  }}
                  sx={{
                    padding: "0.2rem 1rem",
                    backgroundColor: "#f5f5f5",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: "30px" }}>
                    <LogoutIcon sx={{ color: "red", fontSize: "20px" }} />
                  </ListItemIcon>
                  <ListItemText primary="Log out" />
                </ListItemButton>
              </ListItem>
            </List>
          </Popover>
        </Box>
      </Box>
    </>
  );
};

export default PageHeader;
