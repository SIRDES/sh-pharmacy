"use client";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { currencyFormatter } from "@/utils/services/utils";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { deletedProduct, getProuctById, updateProduct } from "@/utils/serverActions/Product";
import dayjs from "dayjs";
import ManageStockModal from "@/components/products/ManageStockModal";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import ManageShopStockModal from "@/components/products/ManageShopStockModal";
import { addShopProduct, getAllShopProducts, updateShopProduct } from "@/utils/serverActions/ShopProduct";



export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { id } = use(params);
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [openManageStockModal, setOpenManageStockModal] = useState(false);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [openManageShopStockModal, setOpenManageShopStockModal] = useState(false);
  const [selectedShopProduct, setSelectedShopProduct] = useState<any>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number | string>("");
  const [stockOperation, setStockOperation] = useState<"ADD" | "SUBTRACT">("ADD");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchProductData = async () => {
    setLoading(true);
    setOrderData({});
    try {
      const orderResponse = await getProuctById(id as string)
      console.log("ProductDetailsResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while fetching product details",
          severity: "error",
        })
        return
      }
      // console.log("Product details", orderResponse?.data)
      setOrderData(orderResponse?.data || {});
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while fetching product details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const handleFetchShopProducts = async () => {
    try {
      if (!selectedShopId || !id) return
      const shopProducts = await getAllShopProducts({ shopId: selectedShopId, productId: id });
      // console.log("shopProducts", shopProducts)
      // setShopProducts(shopProducts?.data?.[0] || null)
      setSelectedShopProduct(shopProducts?.data?.[0] || null)
    } catch (error) {
      console.log(error)
    }
  }
  console.log("selectedShop", selectedShopProduct)
  useEffect(() => {
    if (!selectedShopId || !id) return
    handleFetchShopProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShopId, id])



  const handleCloseManageStockModal = () => {
    setOpenManageStockModal(false);
    setStockValue("");
    setStockOperation("ADD");
  };
  const handleCloseManageShopStockModal = () => {
    setOpenManageShopStockModal(false);
    setStockValue("");
    setStockOperation("ADD");
    setSelectedShopProduct(null);
    setSelectedShopId(null);
  };
  const handleCloseDeleteProductModal = () => {
    setOpenConfirmDeleteModal(false);
  };
  const handleManageStock = async () => {
    handleCloseManageStockModal();
    try {
      if (stockValue === "" || Number(stockValue) <= 0) {
        showAlert({
          title: "Error",
          text: "Invalid stock value",
          severity: "error",
        })
        return
      }
      if (stockOperation === "SUBTRACT" && orderData.currentStock < stockValue) {
        showAlert({
          title: "Error",
          text: "Quantity to be subtracted is more than the available stock",
          severity: "error",
        })
        return;
      }
      setLoading(true);
      const newQuantity = stockOperation === "ADD" ? orderData.currentStock + Number(stockValue) : orderData.currentStock - Number(stockValue)

      const productData = {
        currentStock: newQuantity
      }
      const orderResponse = await updateProduct({ productId: id as string, productData })
      console.log("ProductDetailsResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while editing product",
          severity: "error",
        })
        return
      }

      // // product_stock_updates
      // await product_stock_updates.add({ productId: Number(id), initial_quantity: orderData.current_quantity, added_quantity: stockOperation === "ADD" ? Number(stockValue) : -Number(stockValue) })
      showAlert({
        title: "Success",
        text: "Stock updated successfully",
        severity: "success",
      })

      fetchProductData();
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while updating product stock",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageShopStock = async () => {
    handleCloseManageShopStockModal();
    try {
      if (stockValue === "" || Number(stockValue) <= 0) {
        showAlert({
          title: "Error",
          text: "Invalid stock value",
          severity: "error",
        })
        return
      }
      if (selectedShopProduct === null && selectedShopId === null) {
        showAlert({
          title: "Error",
          text: "Please select a shop",
          severity: "error",
        })
        return
      }
      if (stockOperation === "ADD" && orderData.currentStock < stockValue) {
        showAlert({
          title: "Error",
          text: "Product stock is less than the quantity to be added",
          severity: "error",
        })
        return;
      }
      if (stockOperation === "SUBTRACT" && (selectedShopProduct === null || selectedShopProduct.quantity < stockValue)) {
        showAlert({
          title: "Error",
          text: "Product quantity in the selected shop is less than the quantity to be subtracted",
          severity: "error",
        })
        return;
      }
      setLoading(true);

      const newProductQuantity = stockOperation === "ADD" ? orderData.currentStock - Number(stockValue) : orderData.currentStock + Number(stockValue)
      const productData = {
        currentStock: newProductQuantity
      }
      let orderResponse
      if (selectedShopProduct === null) {
        orderResponse = await addShopProduct({ shopId: selectedShopId as string, productId: id as string, quantity: Number(stockValue) })
      } else {
        const newQuantity = stockOperation === "ADD" ? selectedShopProduct.quantity + Number(stockValue) : selectedShopProduct.quantity - Number(stockValue)
        orderResponse = await updateShopProduct({ shopProductId: selectedShopProduct?._id, productData: { quantity: Number(newQuantity) } })
      }
      await updateProduct({ productId: id as string, productData })
      console.log("ProductDetailsResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while editing product",
          severity: "error",
        })
        return
      }

      // // product_stock_updates
      // await product_stock_updates.add({ productId: Number(id), initial_quantity: orderData.current_quantity, added_quantity: stockOperation === "ADD" ? Number(stockValue) : -Number(stockValue) })
      showAlert({
        title: "Success",
        text: "Stock updated successfully",
        severity: "success",
      })

      fetchProductData();
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while updating product stock",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    handleCloseDeleteProductModal();
    try {
      setLoading(true);
      const orderResponse = await deletedProduct(id as string)
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
        text: "Product deleted successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.back()
        }
      })
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while updating product stock",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <ManageStockModal
        onClose={handleCloseManageStockModal}
        open={openManageStockModal}
        onConfirm={handleManageStock}
        setStockValue={setStockValue}
        setStockOperation={setStockOperation}
        stockValue={stockValue}
        stockOperation={stockOperation}
      />
      <ManageShopStockModal onClose={handleCloseManageShopStockModal} open={openManageShopStockModal} onConfirm={handleManageShopStock} selectedShopId={selectedShopId} setSelectedShopId={setSelectedShopId} selectedShopProduct={selectedShopProduct} setStockValue={setStockValue} setStockOperation={setStockOperation} stockValue={stockValue}
        stockOperation={stockOperation} />
      <ConfirmationModal open={openConfirmDeleteModal} onClose={handleCloseDeleteProductModal} onConfirm={handleDeleteProduct} message="Are you sure you want to delete this product?" title="Delete Product" />
      <LoadingAlert open={loading} />

      <Box mb={10}>
        <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
          <Link
            href={"/products"}
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
              Products
            </Box>
          </Link>
        </Box>
        <Divider />
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
            mb={1}
          // mt={1}
          // px={{ xs: 1, sm: 2, md: 3 }}
          >
            <Typography variant="body1" fontWeight={700} gutterBottom>
              Product Details
            </Typography>
            <Box>
              {orderData?._id && (

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
                      href={`/products/${orderData?._id}/edit`}>
                      Edit
                    </MenuItem>
                    <MenuItem
                      // component={Link}
                      onClick={() => {
                        handleClose()
                        setOpenManageStockModal(true)
                      }}
                    >
                      Manage stock
                    </MenuItem>
                    <MenuItem
                      // component={Link}
                      onClick={() => {
                        handleClose();
                        setOpenManageShopStockModal(true)
                      }}
                    >
                      Manage Shop Qty
                    </MenuItem>
                    <MenuItem
                      // component={Link}
                      sx={{ color: "red" }}
                      onClick={() => {
                        handleClose();
                        setOpenConfirmDeleteModal(true)
                      }}
                    >
                      Delete Product
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>
          {Object.keys(orderData).length !== 0 && (
            <>
              <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {/* product sku */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">SKU:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.sku}
                    </Typography>
                  </Grid>

                  {/* product name */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Name:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.name?.toUpperCase()}
                    </Typography>
                  </Grid>

                  { }
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Cost price:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.costPrice || 0)}
                    </Typography>
                  </Grid>
                  {/* Selling price */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Selling price:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.sellingPrice || 0)}
                    </Typography>
                  </Grid>
                  {/* Profit */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Profit:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.sellingPrice - orderData?.costPrice || 0)}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Current Qty:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.currentStock || 0}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Qty in shops:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {/* {orderData?.shopProducts?.length > 0 ? orderData?.shopProducts?.length : 0} */}
                      {orderData?.shopProducts?.length > 0 ? orderData?.shopProducts?.map((shopProduct: any) => shopProduct?.quantity).reduce((a: number, b: number) => a + b, 0) : 0}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Expiry Date:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.expiryDate ? dayjs(orderData.expiryDate).format("ddd DD MMM YYYY") : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Expiry Status:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.expiryDate
                        ? (() => {
                          const today = dayjs();
                          const expiry = dayjs(orderData.expiryDate);
                          if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
                            return "Expired";
                          } else if (expiry.isBefore(today.add(3, "month"), "day")) {
                            return "Expiring soon";
                          } else {
                            return "Not yet";
                          }
                        })()
                        : ""}
                    </Typography>
                  </Grid>
                  {/* created at */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Created at:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.updatedAt ? dayjs(orderData.updatedAt).format("ddd DD MMM YYYY HH:mm:ss A") : ""}
                    </Typography>
                  </Grid>
                  {/* Updated at */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Updated at:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.updatedAt ? dayjs(orderData.updatedAt).format("ddd DD MMM YYYY HH:mm:ss A") : ""}
                    </Typography>
                  </Grid>

                </Grid>
              </Card>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                  <Typography variant="body1" fontWeight={700} mb={2}>
                    Shops
                  </Typography>
                  <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table aria-label="results table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Qty</StyledTableCell>
                            {/* <StyledTableCell>Date</StyledTableCell> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderData?.shopProducts?.length !== 0 &&
                            orderData?.shopProducts?.map(
                              (ordetItem: any, index: number) => (
                                <StyledTableRow key={ordetItem?.id + index}>
                                  <StyledTableCell>
                                    {ordetItem?.shopDetails?.name?.toUpperCase()}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {ordetItem?.quantity}
                                  </StyledTableCell>
                                  {/* <StyledTableCell>
                                    {ordetItem?.createdAt}
                                  </StyledTableCell> */}
                                </StyledTableRow>
                              )
                            )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                  <Typography variant="body1" fontWeight={700} mb={2}>
                    Stock History
                  </Typography>
                  <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table aria-label="results table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Initial Qty</StyledTableCell>
                            <StyledTableCell>Added Qty</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderData?.product_stock_updates
                            ?.length !== 0 &&
                            orderData?.product_stock_updates
                              ?.map(
                                (history: any, index: number) => (
                                  <StyledTableRow key={index}>
                                    <StyledTableCell>
                                      {history?.createdAt}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {history?.initial_quantity}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {history?.added_quantity}
                                    </StyledTableCell>
                                  </StyledTableRow>
                                )
                              )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid> */}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
