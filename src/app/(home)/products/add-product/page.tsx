"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { addProduct } from "@/utils/serverActions/Product";
import { showAlert } from "@/components/Alerts";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingAlert from "@/components/LoadingAlert";
import { addAProductStockHistory } from "@/utils/serverActions/ProductStockHistory";
import stocks from "../../../../utils/stock.json"
// ✅ Yup schema for a single product
const productSchema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  sellingPrice: yup.string().required("Selling price is required"),
  costPrice: yup.string().required("Cost price is required"),
  currentStock: yup.string().required("Total stock is required"),
  expiryDate: yup.date().required("Expiry date is required"),
});

// ✅ Full form schema: array of products (required!)
const formSchema = yup.object().shape({
  products: yup.array().of(productSchema).min(1).required(),
});

type Product = yup.InferType<typeof productSchema>;
type FormValues = yup.InferType<typeof formSchema>;

export default function AddProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      products: [
        {
          name: "",
          sellingPrice: "",
          costPrice: "",
          currentStock: "",
          expiryDate: new Date(),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const onSubmit = async (data: FormValues) => {
    // console.log("Submitted Products:", data.products);

    const products = data.products.map((product) => ({
      name: product.name?.trim()?.toUpperCase(),
      sellingPrice: Number(product.sellingPrice),
      costPrice: Number(product.costPrice),
      currentStock: Number(product.currentStock),
      expiryDate: product.expiryDate,
    }))
    setLoading(true);
    try {
      const res = await addProduct(products);
      // console.log("res", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while adding product",
          severity: "error",
        })
        return
      }
      showAlert({
        title: "Success",
        text: "Products added successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.push("/products");
        }
      })
      reset();
    } catch (error: any) {
      console.log("add product error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while adding product",
        severity: "error",
      })

    } finally {
      setLoading(false);
    }

  };
  const handleAddStock = async () => {
    // console.log("Submitted Products:", data.products);

    const products = stocks.map((product) => ({
      name: product.NAME?.trim()?.toUpperCase(),
      sellingPrice: Number(product.PRICE),
      costPrice: Number(product.PRICE),
      currentStock: Number(product["QTY "]),
      expiryDate: new Date(product.DATE),
    }))
    setLoading(true);
    try {
      const res = await addProduct(products);
      // console.log("res", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while adding product",
          severity: "error",
        })
        return
      }
      showAlert({
        title: "Success",
        text: "Products added successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.push("/products");
        }
      })
      reset();
    } catch (error: any) {
      console.log("add product error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while adding product",
        severity: "error",
      })

    } finally {
      setLoading(false);
    }

  };

  return (
    <>
      <LoadingAlert open={loading} />
      <Box p={4} pt={2}>
        <Typography variant="body1" gutterBottom>
          Add Products
        </Typography>
        {/* <Button onClick={handleAddStock}>Add Stock</Button> */}

        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <Card
              key={field.id}
              sx={{
                mb: 2,
                border: "1px solid #ccc",
              }}
              elevation={0}

            >
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  Product {index + 1}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Controller
                      name={`products.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Product Name"
                          fullWidth
                          error={!!errors.products?.[index]?.name}
                          helperText={errors.products?.[index]?.name?.message}
                        />
                      )}
                    />
                  </Grid>



                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Controller
                      name={`products.${index}.costPrice`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          label="Cost Price"
                          fullWidth
                          error={!!errors.products?.[index]?.costPrice}
                          helperText={errors.products?.[index]?.costPrice?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Controller
                      name={`products.${index}.sellingPrice`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          label="Selling Price"
                          fullWidth
                          error={!!errors.products?.[index]?.sellingPrice}
                          helperText={errors.products?.[index]?.sellingPrice?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Controller
                      name={`products.${index}.currentStock`}
                      control={control}

                      render={({ field }) => (
                        <TextField
                          {...field}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          type="number"
                          label="Total Stock"
                          fullWidth
                          error={!!errors.products?.[index]?.currentStock}
                          helperText={errors.products?.[index]?.currentStock?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Controller
                      name={`products.${index}.expiryDate`}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                          <DatePicker
                            {...field}
                            label="Expiry Date"
                            views={['year', 'month', 'day']}
                            value={dayjs(field.value)}
                            onChange={(date) => field.onChange(date?.toDate())}
                          />
                        </LocalizationProvider>
                      )}
                    />
                    {errors.products?.[index]?.expiryDate && (
                      <Typography color="error" variant="body2">
                        {errors.products?.[index]?.expiryDate?.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {/* ✅ Remove Button — not for first product */}
                {index !== 0 && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"

            onClick={() =>
              append({
                name: "",
                sellingPrice: "",
                costPrice: "",
                currentStock: "",
                expiryDate: new Date(),
              })
            }
          >
            Add Another Product
          </Button>

          <Box mt={4}>
            <Button type="submit" variant="contained" color="primary">
              Submit Products
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
}
