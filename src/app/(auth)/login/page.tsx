"use client";
import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import LoadingAlert from "@/components/LoadingAlert";
import { SnackbarType } from "@/types/commonTypes";
import { signIn, useSession } from "next-auth/react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AddUser } from "@/utils/serverActions/user";
import { showAlert } from "@/components/Alerts";

const schema = Yup.object().shape({
  email: Yup.string().required(),
  password: Yup.string().required(),
});
export interface FormData extends Yup.InferType<typeof schema> { }

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const session = useSession();
  const [showPassword, setShowPassword] = React.useState(false);
  // const posAuth = (window as any)?.pos?.auth
  // console.log("posAuth>>>>", posAuth?.isFromElectron());
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });
  const form = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    // control,
  } = form;
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const Submit = async (dat: FormData) => {
    // console.log("formData", dat);
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: dat.email,
        password: dat.password,
        callbackUrl: "/dashboard",
        redirect: false,
      })
      console.log("signin res", res);
      if (res?.error === null) {
        if (session?.data?.user?.role === "admin") {
          router.push("/dashboard");
          return;
        }
        router.push("/teacher/attendance");
      } else {
        console.log("ErrorRes", JSON.stringify(res));
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.error || "An error occurred",
        })
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.error || error.message || "An error occurred",
      })
    } finally {
      setLoading(false);
    };

  };
  // const AddAdminStaff = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await AddUser({
  //       name: "Admin",
  //       role: "admin",
  //       username: "admin",
  //       password: "admin",
  //       gender: "male",
  //       phoneNumber: "1234567890",
  //     });
  //     console.log("res", res);
  //     showAlert({
  //       title: "Success",
  //       severity: "success",
  //       text: res.message,
  //     })
  //   } catch (error: any) {
  //     console.log("error", error);
  //     showAlert({
  //       title: "Error",
  //       severity: "error",
  //       text: error.message || "An error occurred",
  //     })
  //   } finally {
  //     setLoading(false);
  //   }

  // };

  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }
  if (session?.status === "authenticated") {
    router.push("/dashboard");
    return;
  }
  return (
    <>
      <LoadingAlert open={loading} />
      <Box
        height={"100vh"}
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* <Button onClick={AddAdminStaff}>
          Add Admin Staff
        </Button> */}
        <Typography variant="h5" textAlign={"center"} gutterBottom>
          STEVHANS PHARMACY
        </Typography>

        <Box sx={{ mx: "auto", width: { xs: "100%", sm: "80%", md: "40%" } }}>
          <Card
            component={"form"}
            onSubmit={handleSubmit(Submit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              // justifyContent: "center",
              // alignItems: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 30px 0px #00000012",
              gap: "30px",
              color: theme.palette.text.primary,
              p: { xs: 2, sm: 4 },
            }}
          >
            <Box>
              <Typography
                variant="h5"
                textAlign={"center"}
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Sign In
              </Typography>

            </Box>
            {/* Username */}
            <Box>
              <Typography gutterBottom>Username</Typography>
              <TextField
                fullWidth
                type="test"
                variant="standard"
                placeholder="Enter your username"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("email", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.email?.message}
              </Typography>
            </Box>
            {/* Password */}
            <Box>
              <Typography gutterBottom>Password</Typography>
              <TextField
                fullWidth
                variant="standard"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("password", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.password?.message}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={!isDirty || !isValid}
                sx={{ mb: 2, padding: "7px" }}
              >
                sign In
              </Button>

            </Box>
          </Card>
        </Box>
      </Box>
    </>
  );
}
