"use client";

import {
  Box,
  Button,
  Card,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import ConfirmationModal from "@/components/ConfirmationModal";
import Link from "next/link";
import { getUserById, updateUser } from "@/utils/serverActions/user";
import dayjs from "dayjs";

export default function UserDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { id } = use(params);
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [openConfirmActivation, setOpenConfirmActivation] = useState(false);
  const [checked, setChecked] = useState(false);


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setChecked(event.target.checked);
    setOpenConfirmActivation(true);
  };
  const handleChangeUserStatus = async () => {
    setLoading(true);
    setOpenConfirmActivation(false);
    try {

      const res = await updateUser({ userId: id, userData: { isSuspended: !orderData?.isSuspended } });
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while updating user status",
          severity: "error",
        });
        return;
      }
      fetchUserData();
      showAlert({
        title: "Success",
        text: `User status changed to ${checked ? "active" : "inactive"} successfully`,
        severity: "success"
      });
      // setSnackbar({
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while updating user status",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchUserData = async () => {
    setLoading(true);
    setOrderData({});

    try {
      const res = await getUserById(id as string);
      // console.log("userDetails", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while fetching user details",
          severity: "error",
        });
        return;
      }

      const userDetails = res?.data;
      setChecked(userDetails.isSuspended ? false : true);
      // console.log(userDetails);
      setOrderData(userDetails);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching user details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <LoadingAlert open={loading} />

      <ConfirmationModal
        open={openConfirmActivation}
        onClose={() => setOpenConfirmActivation(false)}
        onConfirm={() => handleChangeUserStatus()}
        message="Are you sure you want to change user status?"
        title="Change user status"
      />

      <Box mb={10}>

        <>
          <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
            <Link
              href={`/users`}
              style={{
                textDecoration: "none",
                color: "black",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <ArrowUpwardIcon />
                Users
              </Box>
            </Link>
          </Box>
          <Divider />
        </>

        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
          // mt={1}
          // px={{ xs: 1, sm: 2, md: 3 }}
          >
            <Typography variant="body1" fontWeight={700} gutterBottom>
              User Details
            </Typography>
            <Box display="flex" gap={4}>
              {orderData?._id && (
                <>
                  <FormGroup>
                    <FormControlLabel
                      label={
                        <Typography
                          variant="body1"
                          style={{ fontWeight: "bold" }}
                        >
                          {checked
                            ? "Deactivate user account"
                            : "Activate user account"}
                        </Typography>
                      }
                      labelPlacement="start"
                      control={
                        <Switch
                          checked={checked}
                          onChange={handleStatusChange}
                        />
                      }
                    />
                  </FormGroup>


                  <Box>

                    <Button
                      variant="contained"
                      disableElevation
                      onClick={(event) =>
                        handleMenuClick(event)
                      }

                      size="small"
                    // startIcon={<EditIcon />}
                    >
                      Action
                    </Button>

                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      transformOrigin={{
                        horizontal: "right",
                        vertical: "top",
                      }}
                      anchorOrigin={{
                        horizontal: "right",
                        vertical: "bottom",
                      }}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      <MenuItem component={Link}
                        href={`/users/${id}/edit`}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        href={`/users/${id}/reset-password`}
                      >
                        Reset password
                      </MenuItem>



                    </Menu>
                  </Box>
                </>
              )}

            </Box>
          </Box>
          {Object.keys(orderData).length !== 0 && (

            <Card >
              <Grid container spacing={2} sx={{ p: 2 }}>

                {/*  name */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.name?.toUpperCase()}
                  </Typography>
                </Grid>
                {/* username */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Username:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.username}
                  </Typography>
                </Grid>
                {/* gender */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Gender:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.gender}
                  </Typography>
                </Grid>
                {/* phone number */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Phone number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.phoneNumber}
                  </Typography>
                </Grid>
                {/* role */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Role:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.role?.toUpperCase()}
                  </Typography>
                </Grid>

                {/* shop */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Shop:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.assignedShop?.name?.toUpperCase() || "N/A"}
                  </Typography>
                </Grid>

                {/* Created at */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Created at:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.createdAt
                      ? dayjs(orderData.createdAt).format("ddd DD MMM YYYY HH:mm:ss A")
                      : ""}
                  </Typography>
                </Grid>
                {/* Updated at */}
                <Grid
                  size={{ xs: 12, sm: 12, md: 6 }}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Updated at:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.updatedAt ? dayjs(orderData.updatedAt).format("ddd DD MMM YYYY HH:mm:ss A") : ""}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

          )}
        </Box>
      </Box>
    </>
  );
}
