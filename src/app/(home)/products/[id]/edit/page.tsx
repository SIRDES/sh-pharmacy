"use client";
import React, { SyntheticEvent, use, useEffect, useState } from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { yupResolver } from "@hookform/resolvers/yup";
import { date, InferType, object, string } from "yup";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { CustomizedSelect } from "@/components/CustomizedSelect";
import { getProuctById, updateProduct } from "@/utils/serverActions/Product";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs, { Dayjs } from "dayjs";
import { signOut, useSession } from "next-auth/react";


const schema = object().shape({
  name: string().required("Product name is required"),
  sellingPrice: string().required("Selling price is required"),
  costPrice: string().required("Cost price is required"),
  // currentStock: string().required("Total stock is required"),
  expiryDate: date().required("Expiry date is requred"),
});

type FormData = InferType<typeof schema>;

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const theme = useTheme();
  const { data: session } = useSession();
  const { id } = use(params);

  const router = useRouter();
  // const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loadingCategoriesState, setLoadingCategoriesState] = useState<
    null | string
  >();
  const [productData, setProductData] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const form = useForm({
    defaultValues: {
      sellingPrice: "",
      costPrice: "",
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





  const fetchProductDetails = async () => {
    setLoading(true);
    setProductData({});
    try {
      const orderResponse = await getProuctById(id as string)
      // console.log("ProductDetailsResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while fetching product details",
          severity: "error",
        })
        return
      }

      // console.log("Product details", orderResponse?.data)
      setProductData(orderResponse?.data || {});
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching product details",
        severity: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (Object.keys(productData).length > 0) {

      setValue("name", productData?.name?.toUpperCase() || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("costPrice", productData?.costPrice || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("sellingPrice", productData?.sellingPrice || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("expiryDate", productData?.expiryDate || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSelectedDate(dayjs(productData?.expiryDate));

    }
    // eslint-disable-next-line
  }, [productData]);

  const hanldleExpiryDateChange = (date: PickerValue) => {
    setValue("expiryDate", new Date(date?.toString() || ""), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setSelectedDate(dayjs(date));
  }
  const Submit = async (dat: FormData) => {
    // console.log("formData", dat);

    if (dat.sellingPrice === "" || dat.costPrice === "") {
      showAlert({
        title: "Error",
        text: "Selling price and cost price is required",
        severity: "error",
      })
      return;
    }
    setLoading(true);
    try {
      const productData = {
        name: dat?.name?.trim()?.toLowerCase(),
        sellingPrice: Number(dat?.sellingPrice),
        costPrice: Number(dat?.costPrice),
        expiryDate: dat?.expiryDate
      }
      const orderResponse = await updateProduct({ productId: id as string, productData })
      // console.log("ProductDetailsResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while editing product",
          severity: "error",
        })
        return
      }
      showAlert({
        title: "Success",
        text: "Product updated successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.back();
        }
      })
    } catch (error: any) {
      console.log("edit product error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while editing product",
        severity: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <LoadingAlert open={true} />
  if (session?.user?.role !== "admin") {
    signOut();
    return
  }
  return (
    <>
      <LoadingAlert open={loading} />

      <Box px={{ xs: 1, sm: 2, md: 3 }}>
        <Tooltip title="Go back">
          <IconButton style={{ marginTop: 2 }}>
            <ArrowBackIcon onClick={() => router.back()} />
          </IconButton>
        </Tooltip>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            EDIT PRODUCT
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
            <Typography fontWeight="bold">
              Edit product details below
            </Typography>

            <Grid container spacing={1} alignItems={"flex-start"}>
              {/* product name */}
              <Grid size={{ xs: 12, sm: 12, md: 8 }}>
                <Box>
                  <Typography gutterBottom>
                    Product name{" "}
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
                    placeholder="Enter name"
                    inputProps={{
                      style: {
                        width: "100%",
                        border: "2px solid #ABB3BF",
                        padding: "10px 10px",
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
              {/*Exipry date */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Expiry date{" "}
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={selectedDate}
                      onChange={hanldleExpiryDateChange}
                      views={['year', 'month', 'day']}
                      minDate={dayjs(new Date())}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          InputProps: {
                            style: {
                              width: "100%",
                              border: "2px solid #ABB3BF",
                              padding: "6px 10px",
                              borderRadius: "5px",
                            },
                          },
                        },

                      }}
                      sx={{
                        width: "100%",
                      }}
                    />
                  </LocalizationProvider>

                  <Typography color="error" variant="subtitle2">
                    {errors?.expiryDate?.type === "typeError"
                      ? "Expiry date is required"
                      : errors.expiryDate?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* Cost price */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Cost Price{" "}
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
                    type="number"
                    min="0"
                    fullWidth
                    variant="standard"
                    placeholder="Enter cost price"
                    inputProps={{
                      style: {
                        width: "100%",
                        border: "2px solid #ABB3BF",
                        padding: "10px 10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("costPrice")}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.costPrice?.type === "typeError"
                      ? ""
                      : errors.costPrice?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* Selling price */}
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Box>
                  <Typography gutterBottom>
                    Selling Price{" "}
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
                    type="number"
                    min="0"
                    fullWidth
                    variant="standard"
                    placeholder="Enter unit price"
                    inputProps={{
                      style: {
                        width: "100%",
                        border: "2px solid #ABB3BF",
                        padding: "10px 10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("sellingPrice")}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.sellingPrice?.type === "typeError"
                      ? ""
                      : errors.sellingPrice?.message}
                  </Typography>
                </Box>
              </Grid>

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
