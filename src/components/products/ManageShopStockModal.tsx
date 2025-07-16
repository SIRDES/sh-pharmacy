import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, TextField, MenuItem, Select, Grid } from "@mui/material";
import { CustomizedSelect } from "../CustomizedSelect";
import { useShops } from "@/hooks/useShops";
import { getAllShopProducts } from "@/utils/serverActions/ShopProduct";
import { set } from "mongoose";

interface ManageShopStockModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  setStockValue: React.Dispatch<React.SetStateAction<number | string>>;
  setStockOperation: React.Dispatch<React.SetStateAction<"ADD" | "SUBTRACT">>;
  stockValue: number | string;
  stockOperation: "ADD" | "SUBTRACT";
  selectedShopId: string | null,
  selectedShopProduct: any;
  setSelectedShopId: React.Dispatch<React.SetStateAction<string | null>>
}

const ManageShopStockModal: React.FC<ManageShopStockModalProps> = ({
  open,
  onClose,
  onConfirm,
  setStockValue,
  setStockOperation,
  selectedShopId,
  selectedShopProduct,
  setSelectedShopId,
  stockValue,
  stockOperation
}) => {
  const { shops } = useShops()
  // const [operation, setOperation] = useState<"ADD" | "SUBTRACT">("ADD");
  // const [value, setValue] = useState<number | string>(0);
  // const [shopId, setShopId] = useState<string>("");
  // const [shopProducts, setShopProducts] = useState<any>(null);
  // const handleFetchShopProducts = async () => {
  //   try {
  //     const shopProducts = await getAllShopProducts({ shopId: shopId, productId: productId });
  //     // console.log("shopProducts", shopProducts)
  //     setShopProducts(shopProducts?.data?.[0] || null)
  //     setSelectedShopProduct(shopProducts?.data?.[0] || null)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
  // console.log("selectedShop", shopProducts)
  // useEffect(() => {
  //   if (!shopId || !productId) return
  //   handleFetchShopProducts()
  // }, [shopId, productId])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="add-modal-title"
      aria-describedby="add-modal-description"
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          pt: 2,
          minWidth: 400,
          // minWidth: "100%",
        }}
      >
        <Typography variant="h6" mb={2} id="delete-modal-title">
          Manage shop stock
        </Typography>

        {/* <Typography variant="body1" mb={1} id="delete-modal-title">
          Enter quantity to add/substract from product stock
        </Typography> */}

        <Grid container spacing={2}>

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
                  if (selectedShopId === null || selectedShopId === "") {
                    return (
                      <em style={{ color: "#ABB3BF" }}>Select shop</em>
                    );
                  } else {
                    return <em>{shops?.find((shop: any) => shop._id === selectedShopId)?.name?.toUpperCase()}</em>;
                  }
                }}
                value={selectedShopId || ""}
                onChange={(e) => {
                  // setShopId(e.target.value);
                  setSelectedShopId(e.target.value)
                }}
              // {...register("assignedShop", {
              //   required: true,
              // })}
              >
                {shops && shops?.map((shop: any) => (
                  <MenuItem key={shop._id} value={shop._id}>
                    {shop?.name?.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {/* <Typography color="error" variant="subtitle2">
                {errors.assignedShop?.message}
              </Typography> */}
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              type={"number"}
              disabled
              value={selectedShopProduct?.quantity || 0}
              // onChange={(e) => {
              //   const value = e.target.value;
              //   setValue(value);
              //   setStockValue(value);
              // }}
              inputProps={{
                style: {
                  border: "2px solid #ABB3BF",
                  padding: "9px",
                  // paddingTop: "17px",
                  borderRadius: "5px",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Select
              fullWidth
              displayEmpty
              input={<CustomizedSelect />}
              value={stockOperation || "ADD"}
              onChange={(e) => {
                const operationValue = e.target.value as "ADD" | "SUBTRACT";
                // setOperation(operationValue);
                setStockOperation(operationValue);
              }}
            >
              <MenuItem value={"ADD"}>ADD</MenuItem>
              <MenuItem value={"SUBTRACT"}>SUBTRACT</MenuItem>
            </Select>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              type={"number"}
              placeholder="enter quantity"
              value={stockValue === 0 ? "" : stockValue}
              onChange={(e) => {
                const value = e.target.value;
                // setValue(value);
                setStockValue(value);
              }}
              inputProps={{
                style: {
                  border: "2px solid #ABB3BF",
                  padding: "9px",
                  // paddingTop: "17px",
                  borderRadius: "5px",
                },
              }}
            />
          </Grid>

        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              // setValue(0);
              // setOperation("ADD");
            }}
            disabled={stockValue === 0 || selectedShopId === null}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ManageShopStockModal;
