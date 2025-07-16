"use client"

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,

  InputAdornment,

  TableCell,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";


import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { getAllShops } from "@/utils/serverActions/Shop";
import { signOut, useSession } from "next-auth/react";
import AddShopModal from "@/components/shops/AddShopModal";

// Initialize Firestore

export default function Categories() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openAddNewShopDialog, setOpenAddNewShopDialog] =
    useState(false);

  const [fetchedShops, setFetchedShops] = useState<any>(null);
  const [shops, setShops] = useState<Array<any>>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchShopData = async () => {
    setLoading(true);
    setFetchedShops([]);
    setShops([]);

    try {
      const res = await getAllShops()

      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred",
          severity: "error",
        });
        return;
      }

      // if (res?.data?.length === 0) {
      //   showAlert({
      //     title: "No Categories",
      //     text: "No categories found. Please add a new category.",
      //     severity: "warning",
      //   });

      //   return;
      // }
      setFetchedShops(res?.data);
      setShops(res?.data);

    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShopData();
  }, []);

  const handleSearchByShopName = (e: any) => {
    const value = e.target.value;
    if (value === "") {
      setShops(fetchedShops)
      return
    }
    const filteredOrders = fetchedShops.filter((order: any) =>
      order?.name?.toLowerCase().includes(value.toLowerCase())
    );
    setShops(filteredOrders);
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <AddShopModal
        open={openAddNewShopDialog}
        setOpen={setOpenAddNewShopDialog}
        refetchFunction={fetchShopData}
      />
      <Box>
        <Box
          display={"flex"}
          flexDirection={{ xs: "column", md: "row" }}
          gap={{ xs: 1, sm: 2, md: 3 }}
          justifyContent={"space-between"}
          alignItems={{ xs: "flex-start", md: "center" }}
          mb={2}
          mt={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Box display={"flex"} gap={3} sx={{ width: { xs: "100%", md: 400 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search shop"
              onChange={handleSearchByShopName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box display={"flex"} gap={3}>
            <Box>
              <Button
                onClick={() => setOpenAddNewShopDialog(true)}
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "4px",
                  // background: "#5812B3",
                  width: "fit-content",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                New Shop
              </Button>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <Grid container spacing={2}>
            {shops?.length > 0 ? (
              shops.map((category: any, index: number) => (
                <Grid size={{ xs: 12, sm: 12, md: 4 }} key={index}>
                  <Card
                    sx={{ p: 1, borderRadius: "4px", cursor: "pointer" }}
                    onClick={() =>
                      router.push(`/shops/${category?._id}`)
                    }
                  >
                    <Box
                      bgcolor={theme.palette.primary.main}
                      sx={{
                        minHeight: "100px",
                        color: "white",
                        borderRadius: "4px",
                      }}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Typography>{category?.name?.toUpperCase()}</Typography>
                    </Box>
                    {/* <Typography>{category?.name?.toUpperCase()}</Typography> */}
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body1">No shops found</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
