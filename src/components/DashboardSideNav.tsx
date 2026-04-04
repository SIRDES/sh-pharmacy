"use client";

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MobileNavMenu from "./MobileNavMenu";
import LoadingAlert from "./LoadingAlert";
import { useShops } from "@/hooks/useShops";
import { useShopsContext } from "@/context/ShopsContext";

const StyledNavItem = styled(
  (props: {
    href: string;
    component: any;
    children?: React.ReactNode;
    className?: string;
  }) => <Box {...props} />
)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "12px",
  color: "#fff",
  // height:"290px",
  transition: "ease-in-out 0.6s",
  textDecoration: "none",
  "&:hover": {
    color: theme.palette.primary.main,
    borderRadius: "10px",
    // cursor: "pointer",
    // borderLeft: "5px solid #4698CA",
    backgroundColor: theme.palette.common.white,
  },
  "&.active": {
    color: theme.palette.primary.main,
    borderRadius: "10px",
    // cursor: "pointer",
    // borderLeft: "5px solid #4698CA",
    backgroundColor: theme.palette.common.white,
  },
}));

export default function DashboardSideNav({
  sideNavWidth,
  setSideNavWidth,
  userType,
  // navLists,
}: {
  sideNavWidth: string;
  setSideNavWidth: React.Dispatch<React.SetStateAction<string>>;
  userType: string;
  // navLists: { id: number; name: string; href: string }[];
}) {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const theme = useTheme();
  const pathname = usePathname();
  const { shops: shopsData } = useShops();

  const {
    shops,
    selectedShop,
    setSelectedShop,
    setShops,
    setFetchedShops
  } = useShopsContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [batchAnchorEl, setBatchAnchorEl] = useState<null | HTMLElement>(null);
  const [isMobileNav, setISMobileNav] = useState(false);
  // const sideNavWidth = "247px";
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setSideNavWidth(isMobileNav ? "247px" : "80px");
    setISMobileNav((prev: boolean) => !prev);
  };

  useEffect(() => {
    if (!shopsData || shopsData.length === 0) return;
    let lists: any[] = [];
    setFetchedShops(shopsData);
    setShops(shopsData);
    // fetchBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopsData]);

  const handleBatchMenu = (event: React.MouseEvent<HTMLElement>) => {
    setBatchAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleBatchClose = () => {
    setBatchAnchorEl(null);
  };
  const handleBatchClick = (batch: any) => {
    setSelectedShop(batch);
    handleBatchClose();
  };

  const isAdmin = currentUser?.role === "admin";

  type NavItem = {
    id: number;
    name: string;
    href: string;
  };

  const navLists: NavItem[] = [
    {
      id: 1,
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      id: 2,
      name: "Sales",
      href: "/sales",
    },
    {
      id: 3,
      name: "Products",
      href: "/products",
    },
    isAdmin && {
      id: 4,
      name: "Shops",
      href: "/shops",
    },
    isAdmin && {
      id: 5,
      name: "Users",
      href: "/users",
    },
  ].filter(Boolean) as NavItem[];


  return (
    <>
      <LoadingAlert open={loading} />
      <MobileNavMenu navLists={navLists} />
      <Box
        sx={{
          //  position:"relative",
          backgroundColor: theme.palette.primary.main,
          width: sideNavWidth,
          minHeight: "100vh",
          position: "fixed",
          padding: "30px",
          transition: "ease-in-out 0.6s",
          display: { xs: "none", md: "block" },
        }}
      >
        {isMobileNav ? (
          ""
        ) : (
          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={"10px"}
            sx={{ transition: "ease-in-out 0.6s" }}
          >
            <Typography
              variant="h6"
              color={theme.palette.common.white}
              gutterBottom
            >
              SH-PHARMACY
            </Typography>

            {/* batch dropdown */}
            {isAdmin ? (
              <Box>
                <Box
                  display={"flex"}
                  gap={"5px"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  mb={2}
                  sx={{
                    color: theme.palette.common.white,
                    cursor: "pointer",
                    // width: "100%",
                    padding: "1px 1px",

                    transition: "ease-in-out 0.6s",
                    "&:hover": {
                      backgroundColor: "#4698CA",
                      color: theme.palette.primary.main,
                      // fontWeight:"bold",
                      borderRadius: "3px",
                    },
                  }}
                  onClick={handleBatchMenu}
                >
                  <Typography variant="caption">
                    {selectedShop?.name}
                  </Typography>
                  <ArrowDropDownIcon sx={{ marginBottom: "3px" }} />
                </Box>
                <Menu
                  id="menu-batch"
                  anchorEl={batchAnchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(batchAnchorEl)}
                  onClose={handleBatchClose}
                >
                  {shops.map(
                    (batch: any, index: number) => (
                      <MenuItem
                        key={index}
                        sx={{ fontSize: "12px" }}
                        onClick={() => handleBatchClick(batch)}
                      >
                        {batch?.name?.toUpperCase()}
                      </MenuItem>
                    )
                  )}
                </Menu>
              </Box>
            ) : (
              <Typography variant="caption" color={theme.palette.common.white}>
                {shops?.find(
                  (shop: any) => shop?._id === currentUser?.assignedShop?._id
                )?.name?.toUpperCase()}
              </Typography>
            )}

            <Box display={"flex"} flexDirection={"column"} gap={"5px"}>
              {navLists.map((nav) => (
                <StyledNavItem
                  key={nav.id}
                  component={Link}
                  href={nav.href}
                  className={`${pathname.includes(nav.href) || pathname === nav.href
                    ? "active"
                    : ""
                    }`}
                >
                  <Typography fontSize={"14px"}>{nav.name}</Typography>
                </StyledNavItem>
              ))}
            </Box>
          </Box>
        )}

        <IconButton
          style={{
            backgroundColor: theme.palette.background.paper,
            position: "absolute",
            top: "17%",
            right: "-15px",
            fontSize: "16px",
            border: "1px solid #E7E9EE",
          }}
          onClick={handleClick}
        >
          {isMobileNav ? (
            <ArrowForwardIosIcon sx={{ fontSize: "inherit" }} />
          ) : (
            <ArrowBackIosNewIcon sx={{ fontSize: "inherit" }} />
          )}
        </IconButton>

      </Box>
    </>
  );
}
