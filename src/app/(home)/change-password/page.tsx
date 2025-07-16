"use client";
import { useState } from "react";

import {
  Box,
  Divider,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Button,
  FormControl,
  Stack,
  Grid,
  FormLabel,
  Typography,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { Controller, useForm } from "react-hook-form";
import { showAlert } from "@/components/Alerts";
import { useRouter } from "next/navigation";
import LoadingAlert from "@/components/LoadingAlert";
import { changePassword } from "@/utils/serverActions/user";
import { signOut } from "next-auth/react";
const ChangePassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const posAuth = (window as any).pos?.auth;
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      console.log("data", data);
      const res = await changePassword({ oldPassword: data.oldPassword, password: data.newPassword });
      if (!res?.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res.message || "An error occurred!",
        });
        return
      }

      showAlert({
        title: "Success",
        severity: "success",
        text: res.message || "Password changed successfully!",
        handleConfirmButtonClick: async () => {
          await signOut();
          // router.push("/login");
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />

      <Box
        sx={{
          width: "100%",
          height: "60vh",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: "640px",
            position: "relative",
            background: "#fff",
          }}
          elevation={1}
        >
          <Box
            sx={{
              width: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "1rem 2rem",
            }}
          >
            <Stack direction="row" spacing={1} alignItems={"center"}>

              <Stack>
                <Typography variant="body1">
                  <b>Change Password</b>
                </Typography>
                {/* <Typography variant="body2">
                  Please update your password
                </Typography> */}
              </Stack>
            </Stack>
          </Box>
          <Divider />
          <FormControl
            sx={{ color: "#000", width: "100%", position: "relative" }}
            size="small"
          >
            <Grid
              container
              columns={12}
              sx={{
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                container
                columns={12}
                spacing={2}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Grid size={{ xs: 3, md: 3 }}>
                  <FormLabel sx={{ color: "#000", mb: 1 }}>
                    Old Password
                  </FormLabel>
                </Grid>
                <Grid size={{ xs: 9, sm: 9, }}>
                  <Stack
                    spacing={1}
                    sx={{ width: "100%", position: "relative" }}
                  >
                    <Controller
                      control={control}
                      name="oldPassword"
                      rules={{ required: "Old Password is required!" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          sx={{}}
                          // onKeyDown={e => {
                          //   if (e.key === 'Enter') {
                          //     handleSubmit(handleLogin)();
                          //   }
                          // }}
                          type={showPassword ? "text" : "password"}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: theme.palette.primary.main,
                                    }}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  />
                                ) : (
                                  <VisibilityOutlinedIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: theme.palette.primary.main,
                                    }}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  />
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    {errors.oldPassword && (
                      <p style={{ fontSize: "12px", color: "red" }}>
                        {errors.oldPassword.message}
                      </p>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              container
              columns={12}
              sx={{
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                container
                columns={12}
                spacing={2}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Grid size={{ xs: 3, sm: 3, }}>
                  <FormLabel sx={{ color: "#000", mb: 1 }}>
                    New Password
                  </FormLabel>
                </Grid>
                <Grid size={{ xs: 9, sm: 9, }}>
                  <Stack
                    spacing={1}
                    sx={{ width: "100%", position: "relative" }}
                  >
                    <Controller
                      control={control}
                      name="newPassword"
                      rules={{ required: "New Password is required!" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          sx={{}}
                          type={showPassword ? "text" : "password"}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: theme.palette.primary.main,
                                    }}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  />
                                ) : (
                                  <VisibilityOutlinedIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: theme.palette.primary.main,
                                    }}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  />
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    {errors.newPassword && (
                      <p style={{ fontSize: "12px", color: "red" }}>
                        {errors.newPassword.message}
                      </p>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </FormControl>

          <Divider />
          <Box
            sx={{
              width: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "flex-end",
              alignItemsItems: "center",
              padding: "1rem 2rem",
            }}
          >
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize" }}
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
              disableElevation
              disableRipple
              disableTouchRipple
              disableFocusRipple
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                "Update Password"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>


    </>
  );
};

export default ChangePassword;
