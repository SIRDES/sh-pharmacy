"use client";

import React, { SyntheticEvent, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Typography,
  useTheme,
  Button,
  MenuItem,
  TextField,
  Grid,
  Card,
  Select,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, string, ref } from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { CustomizedSelect } from "@/components/CustomizedSelect";
import { getAllShops } from "@/utils/serverActions/Shop";
import { AddUser } from "@/utils/serverActions/user";

const schema = object().shape({
  name: string().required("Name is required"),
  username: string().required("Username is required"),
  gender: string().required("Gender is required"),
  role: string().required("Role is required"),
  password: string().required("Password is required"),
  confirmPassword: string().oneOf(
    [ref("password"), undefined],
    "Passwords must match"
  ),
  phoneNumber: string().required("Phone number is required"),
  assignedShop: string(),
});

type FormData = InferType<typeof schema>;

export default function AddNewUser() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchedShops, setFetchedShops] = useState<any[]>([]);
  const form = useForm({
    defaultValues: {
      //   unitPrice: "",
      //   totalStock: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
    // control,
    setValue,
  } = form;


  const fetchShops = async () => {
    // setLoading(true);
    setFetchedShops([]);
    try {
      const res = await getAllShops();
      console.log("res", res);
      setFetchedShops(res?.data);
    } catch (error: any) {

    }
  };
  useEffect(() => {
    fetchShops();
  }, []);



  const Submit = async (dat: FormData) => {
    console.log("formData", dat);
    setLoading(true);
    try {
      const res = await AddUser(dat)
      console.log("add user data res", res);
      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred, please try again",
          severity: "error",
        })
        return
      }
      showAlert({
        title: "Success",
        text: "User added successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.push("/users");
        },
      })
    } catch (error: any) {
      console.log("add user error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred, please try again",
        severity: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <Box px={{ xs: 1, sm: 2, md: 3 }} py={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>
            ADD NEW USER
          </Typography>
          <form
            onSubmit={handleSubmit(Submit)}
            noValidate
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "10px 20px",
            }}
          >
            <Typography fontWeight="bold">Enter user details below</Typography>

            <Grid container spacing={3} alignItems={"flex-start"}>
              {/* name */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Name{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Enter first name"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("name", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.name?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* username */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Username{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Enter last name"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("username", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.username?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* gender */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Gender{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>

                  <Select
                    fullWidth
                    displayEmpty
                    input={<CustomizedSelect />}
                    renderValue={() => {
                      if (watch("gender") === "") {
                        return (
                          <em style={{ color: "#ABB3BF" }}>Select gender</em>
                        );
                      }
                      return watch("gender");
                    }}
                    {...register("gender", {
                      required: true,
                    })}
                  >
                    <MenuItem value={"M"}>M</MenuItem>
                    <MenuItem value={"F"}>F</MenuItem>
                  </Select>
                  <Typography color="error" variant="subtitle2">
                    {errors?.gender?.message}
                  </Typography>
                </Box>
              </Grid>


              {/* phone number */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Phone Number{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Enter phone number"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("phoneNumber", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.phoneNumber?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* Role */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Role{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>

                  <Select
                    fullWidth
                    displayEmpty
                    input={<CustomizedSelect />}
                    renderValue={() => {
                      if (watch("role") === "") {
                        return (
                          <em style={{ color: "#ABB3BF" }}>Select role</em>
                        );
                      } else {
                        return <em>{watch("role")?.toUpperCase()}</em>;
                      }
                    }}
                    {...register("role", {
                      required: true,
                    })}
                  >
                    <MenuItem value={"admin"}>
                      ADMIN
                    </MenuItem>
                    <MenuItem value={"user"}>
                      USER
                    </MenuItem>
                  </Select>
                  <Typography color="error" variant="subtitle2">
                    {errors.role?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* Shop */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Shop
                  </Typography>

                  <Select
                    fullWidth
                    displayEmpty
                    input={<CustomizedSelect />}
                    renderValue={() => {
                      if (watch("assignedShop") === "") {
                        return (
                          <em style={{ color: "#ABB3BF" }}>Select shop</em>
                        );
                      } else {
                        return <em>{fetchedShops?.find((shop: any) => shop._id === watch("assignedShop"))?.name?.toUpperCase()}</em>;
                      }
                    }}
                    {...register("assignedShop", {
                      required: true,
                    })}
                  >
                    {fetchedShops && fetchedShops?.map((shop: any) => (
                      <MenuItem key={shop._id} value={shop._id}>
                        {shop?.name?.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography color="error" variant="subtitle2">
                    {errors.assignedShop?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* password */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Password{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>
                  <TextField
                    // type="password"
                    fullWidth
                    variant="standard"
                    placeholder="Enter password"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("password", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.password?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* confirm password */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Confirm password{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      *
                    </span>
                  </Typography>
                  <TextField
                    // type="password"
                    fullWidth
                    variant="standard"
                    placeholder="Enter confirm password"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("confirmPassword", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.confirmPassword?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* Select profile image */}
              {/* <Grid item xs={12}>
                <Typography variant="body1" gutterBottom fontWeight={"bold"}>
                  Select profile image{" "}
                </Typography>
              </Grid> */}

              {/*Image */}
              {/* <Grid item xs={12}>
                <ImagesDropzone
                  setSelectedImages={setSelectedImages}
                  selectMultiple={false}
                />
              </Grid> */}
            </Grid>
            {/* Buttons */}
            <Box display="flex" gap={2} justifyContent={"flex-end"}>
              <Button
                variant="outlined"
                sx={{ width: "120px" }}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{ width: "120px" }}
                disabled={!isDirty || !isValid || loading}
              >
                Save
              </Button>
            </Box>
          </form>
        </Card>
      </Box>
    </>
  );
}
