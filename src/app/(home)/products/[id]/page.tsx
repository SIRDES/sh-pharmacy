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
  TablePagination,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { currencyFormatter } from "@/utils/services/utils";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { deletedProduct, getAllProducts, getProuctById, updateMultipleProductsStock, updateProduct, updateProductsStock } from "@/utils/serverActions/Product";
import dayjs from "dayjs";
import ManageStockModal from "@/components/products/ManageStockModal";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import ManageShopStockModal from "@/components/products/ManageShopStockModal";
import { addMultipleShopProducts, addShopProduct, getAllShopProducts, updateShopProduct, updateShopProductStock } from "@/utils/serverActions/ShopProduct";
import { getSalesItemsByProductId } from "@/utils/serverActions/SalesItem";
import { addAProductStockHistory, getAllProductStockHistoriesByProductId } from "@/utils/serverActions/ProductStockHistory";
import { useSession } from "next-auth/react";
import { addShopProductStockHistory, getAllShopProductStockHistoriesByShopIdAndProductId } from "@/utils/serverActions/ShopProductStockHistory";
import { USER_ROLES } from "@/types/constants";
import { useShopsContext } from "@/context/ShopsContext";



export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { id } = use(params);
  const { data: session } = useSession();
  const currentUser = session?.user;
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const router = useRouter();
  const {
    selectedShop,
  } = useShopsContext();
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingShopProducts, setLoadingShopProducts] = useState(false);
  // const [fetchShopProductsHasError, setFetchShopProductsHasError] = useState(false);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesPage, setSalesPage] = useState(0);
  const [productStockHistory, setProductStockHistory] = useState<any[]>([]);
  const [productStockHistoryTotal, setProductStockHistoryTotal] = useState(0);
  const [productStockHistoryPage, setProductStockHistoryPage] = useState(0);
  const [shopProductStockHistory, setShopProductStockHistory] = useState<any[]>([]);
  const [shopProductStockHistoryTotal, setShopProductStockHistoryTotal] = useState(0);
  const [shopProductStockHistoryPage, setShopProductStockHistoryPage] = useState(0);
  // const [salesRowsPerPage, setSalesRowsPerPage] = useState(10);
  const [loadingSales, setLoadingSales] = useState(false);

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
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while fetching product details",
          severity: "error",
        })
        return
      }
      console.log("Product details", orderResponse?.data)
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
  const fetchProductSalesHistory = async () => {
    setLoadingSales(true);
    try {
      const orderResponse = await getSalesItemsByProductId({
        productId: id as string,
        page: salesPage + 1,
        // limit: salesRowsPerPage,
        ...(!isAdmin ? { shopId: currentUser?.assignedShop?._id } : {})
      });
      if (orderResponse.success) {
        console.log("salesHistory", orderResponse.data)
        setSalesHistory(orderResponse.data || []);
        setSalesTotal(orderResponse.total || 0);
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while fetching product sales history",
        severity: "error",
      });
    } finally {
      setLoadingSales(false);
    }
  };
  const fetchProductStockHistory = async () => {
    setLoadingSales(true);
    try {
      const orderResponse = await getAllProductStockHistoriesByProductId({
        productId: id as string,
        page: productStockHistoryPage + 1,
        // limit: salesRowsPerPage,
      });
      if (orderResponse.success) {
        console.log("salesHistory", orderResponse.data)
        setProductStockHistory(orderResponse.data || []);
        setProductStockHistoryTotal(orderResponse.total || 0);
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while fetching product sales history",
        severity: "error",
      });
    } finally {
      setLoadingSales(false);
    }
  };
  const fetchShopProductStockHistory = async () => {
    setLoadingSales(true);
    try {
      const orderResponse = await getAllShopProductStockHistoriesByShopIdAndProductId({
        productId: id as string,
        shopId: isAdmin ? selectedShop?._id as string : currentUser?.assignedShop?._id as string,
        page: shopProductStockHistoryPage + 1,
        // limit: salesRowsPerPage,
      });
      if (orderResponse.success) {
        console.log("fetchShopProductStockHistory", orderResponse.data)
        setShopProductStockHistory(orderResponse.data || []);
        setShopProductStockHistoryTotal(orderResponse.total || 0);
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while fetching product sales history",
        severity: "error",
      });
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    if (!id) return
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (!id) return;
    fetchProductSalesHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, salesPage]);

  useEffect(() => {
    if (!id) return;
    fetchProductStockHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, productStockHistoryPage]);
  useEffect(() => {
    if (!id) return;
    fetchShopProductStockHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, shopProductStockHistoryPage, selectedShop]);


  const handleFetchShopProducts = async () => {
    try {
      if (!selectedShopId || !id) return
      setSelectedShopProduct(null)
      setLoadingShopProducts(true);
      const shopProducts = await getAllShopProducts({ shopId: selectedShopId, productId: id });
      // console.log("shopProducts", shopProducts)
      // setShopProducts(shopProducts?.data?.[0] || null)
      if (!shopProducts?.success) {
        handleCloseManageShopStockModal()
        showAlert({
          title: "Error",
          text: "An error occurred while getting shop products",
          severity: "error",
        })
        return
      }
      setSelectedShopProduct(shopProducts?.data?.[0] || null)
    } catch (error) {
      console.log(error)
      handleCloseManageShopStockModal()
      showAlert({
        title: "Error",
        text: "An error occurred while getting shop products",
        severity: "error",
      })
    } finally {
      setLoadingShopProducts(false);
    }
  }
  // console.log("selectedShop", selectedShopProduct)
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
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while editing product",
          severity: "error",
        })
        return
      }

      // // product_stock_updates
      const stockHistoryResponse = await addAProductStockHistory({
        productId: id as string,
        initialQuantity: orderData.currentStock,
        addedQuantity: Number(stockValue),
        operation: stockOperation === "ADD" ? "add" : "subtract",
        userId: currentUser?._id as string,
      })
      // if (!stockHistoryResponse.success) {
      //   showAlert({
      //     title: "Error",
      //     text: stockHistoryResponse?.message || "An error occurred while adding product stock history",
      //     severity: "error",
      //   })
      //   return
      // }
      // await product_stock_updates.add({ productId: Number(id), initial_quantity: orderData.current_quantity, added_quantity: stockOperation === "ADD" ? Number(stockValue) : -Number(stockValue) })
      showAlert({
        title: "Success",
        text: "Stock updated successfully",
        severity: "success",
      })

      fetchProductData();
      fetchProductStockHistory();
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
      let initialShopProductQuantity = 0

      if (selectedShopProduct === null) {
        orderResponse = await addShopProduct({ shopId: selectedShopId as string, productId: id as string, quantity: Number(stockValue), userId: currentUser?._id as string })
      } else {
        initialShopProductQuantity = selectedShopProduct.quantity
        const newQuantity = stockOperation === "ADD" ? selectedShopProduct.quantity + Number(stockValue) : selectedShopProduct.quantity - Number(stockValue)

        orderResponse = await updateShopProductStock({ shopProductId: selectedShopProduct?._id, quantity: Number(newQuantity), shopId: selectedShopId as string, productId: id as string, initialQuantity: selectedShopProduct.quantity, addedQuantity: Number(stockValue), operation: stockOperation === "ADD" ? "add" : "subtract", userId: currentUser?._id as string })

        // orderResponse = await updateShopProductStock({ shopProductId: selectedShopProduct?._id,  productData: { quantity: Number(newQuantity) } })
      }
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred while editing product",
          severity: "error",
        })
        return
      }
      // await updateProduct({ productId: id as string, productData })
      const productStockUpdateResponse = await updateProductsStock({
        productId: id as string,
        currentStock: newProductQuantity,
        initialQuantity: orderData.currentStock,
        addedQuantity: Number(stockValue),
        operation: stockOperation === "ADD" ? "subtract" : "add",
        userId: currentUser?._id as string,
      })


      showAlert({
        title: "Success",
        text: "Stock updated successfully",
        severity: "success",
      })

      fetchProductData();
      fetchProductStockHistory();
      fetchShopProductStockHistory();
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
  const handleManageMultipleShopStock = async (shopId: string) => {
    handleCloseManageShopStockModal();
    if (!shopId || shopId === "") {
      showAlert({
        title: "Error",
        text: "Please select a shop",
        severity: "error",
      })
      return
    }
    try {

      setLoading(true);
      // const shopId = "69ce2dfa19fe312efc8ce7b9"

      const products = await getAllProducts()

      const shopProductsData = products?.data?.map((product: any) => {
        return {
          // shopId: shopId,
          productId: product._id as string,
          quantity: product.currentStock,
          // userId: currentUser?._id as string,
        }
      })

      console.log("shopProductsData", shopProductsData)
      await addMultipleShopProducts({ shopId: shopId, userId: currentUser?._id as string, products: shopProductsData })


      const productsStockUpdates = products?.data?.map((product: any) => {
        return {
          productId: product._id as string,
          currentStock: 0,
          initialQuantity: product.currentStock,
          addedQuantity: product.currentStock,
          operation: "subtract",
          userId: currentUser?._id as string,
        }
      })

      await updateMultipleProductsStock(productsStockUpdates)

      showAlert({
        title: "Success",
        text: "Stock updated successfully",
        severity: "success",
      })

      fetchProductData();
      fetchProductStockHistory();
      fetchShopProductStockHistory();
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
        stockOperation={stockOperation} loadingShopProducts={loadingShopProducts} />

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
            {/* <Button
              variant="contained"
              disableElevation
              onClick={() => handleManageMultipleShopStock("")}
              size="small"
            >
              Manage Multiple Shop Stock
            </Button> */}
            <Box>
              {isAdmin && orderData?._id && (

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
                    {/* <MenuItem
                      // component={Link}
                      sx={{ color: "red" }}
                      onClick={() => {
                        handleClose();
                        setOpenConfirmDeleteModal(true)
                      }}
                    >
                      Delete Product
                    </MenuItem> */}
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
                  {isAdmin && (
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
                    </Grid>)
                  }

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
                  {isAdmin && (
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
                  )}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Current Qty:</Typography>
                    {isAdmin && (
                      <Typography variant="body1" fontWeight={700}>
                        {orderData?.currentStock}
                      </Typography>
                    )}
                    {!isAdmin && (
                      <Typography variant="body1" fontWeight={700}>
                        {orderData?.shopProducts?.filter((shopProduct: any) => shopProduct?.shopDetails?._id?.toString() === currentUser?.assignedShop?._id?.toString())[0]?.quantity || 0}
                      </Typography>
                    )}
                  </Grid>

                  {isAdmin && (
                    <>

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
                    </>
                  )}



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

                  {isAdmin && (
                    <>
                      {/* created at */}
                      <Grid
                        size={{ xs: 12, sm: 6, md: 4 }}
                        sx={{ display: "flex", gap: "10px" }}
                      >
                        <Typography variant="body1">Created at:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {orderData?.createdAt ? dayjs(orderData.createdAt).format("ddd DD MMM YYYY HH:mm:ss A") : ""}
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
                    </>
                  )}


                </Grid>
              </Card>
              <Grid container spacing={2} mb={2}>
                {isAdmin && (
                  < Grid size={{ xs: 12, sm: 12, md: 6 }}>
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orderData?.shopProducts?.length !== 0 &&
                              orderData?.shopProducts?.map(
                                (ordetItem: any, index: number) => (
                                  <StyledTableRow key={index}>
                                    <StyledTableCell>
                                      {ordetItem?.shopDetails?.name?.toUpperCase()}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {ordetItem?.quantity}
                                    </StyledTableCell>

                                  </StyledTableRow>
                                )
                              )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                  <Typography variant="body1" fontWeight={700} mb={2}>
                    Sales History
                  </Typography>
                  <Paper sx={{ width: "100%", overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader aria-label="sales history table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Shop</StyledTableCell>
                            <StyledTableCell>Qty</StyledTableCell>
                            <StyledTableCell>Total</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {salesHistory?.length !== 0 &&
                            salesHistory?.map((item: any, index: number) => (
                              <StyledTableRow key={index}>
                                <StyledTableCell>
                                  {dayjs(item?.createdAt).format("DD MMM YYYY hh:mm A")}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {item?.saleId?.shopId?.name?.toUpperCase()}
                                </StyledTableCell>
                                <StyledTableCell>{item?.qty}</StyledTableCell>
                                <StyledTableCell>
                                  {currencyFormatter(item?.total_amount || 0)}
                                </StyledTableCell>
                              </StyledTableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[]}
                      component="div"
                      count={salesTotal}
                      rowsPerPage={50}
                      page={salesPage}
                      onPageChange={(e, newPage) => setSalesPage(newPage)}
                    />
                  </Paper>
                </Grid>
              </Grid>
              {isAdmin && (
                <>
                  <Typography variant="body1" fontWeight={700} mb={2}>
                    Stock History
                  </Typography>
                  <Paper sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader aria-label="stock history table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>User</StyledTableCell>
                            <StyledTableCell>Initial Qty</StyledTableCell>
                            <StyledTableCell>Operation</StyledTableCell>
                            <StyledTableCell>Value</StyledTableCell>
                            <StyledTableCell>Final Qty</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {productStockHistory?.length !== 0 &&
                            productStockHistory.map((item: any, index: number) => (
                              <StyledTableRow key={index}>
                                <StyledTableCell>
                                  {dayjs(item?.createdAt).format("DD MMM YYYY HH:mm A")}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {item?.user?.name?.toUpperCase() || item?.user?.username?.toUpperCase() || "N/A"}
                                </StyledTableCell>
                                <StyledTableCell>{item?.initialQuantity}</StyledTableCell>
                                <StyledTableCell sx={{ color: item?.operation === "add" ? "green" : "red", fontWeight: 700 }}>
                                  {item?.operation?.toUpperCase()}
                                </StyledTableCell>
                                <StyledTableCell>{item?.addedQuantity}</StyledTableCell>
                                <StyledTableCell>
                                  {item?.operation === "add"
                                    ? item?.initialQuantity + item?.addedQuantity
                                    : item?.initialQuantity - item?.addedQuantity}
                                </StyledTableCell>
                              </StyledTableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[]}
                      component="div"
                      count={productStockHistoryTotal}
                      rowsPerPage={50}
                      page={productStockHistoryPage}
                      onPageChange={(e, newPage) => setProductStockHistoryPage(newPage)}
                    />
                  </Paper></>
              )}


              <Typography variant="body1" fontWeight={700} mb={2}>
                Shop Stock History
              </Typography>
              <Paper sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader aria-label="shop stock history table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>User</StyledTableCell>
                        <StyledTableCell>Initial Qty</StyledTableCell>
                        <StyledTableCell>Operation</StyledTableCell>
                        <StyledTableCell>Value</StyledTableCell>
                        <StyledTableCell>Final Qty</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shopProductStockHistory?.length !== 0 &&
                        shopProductStockHistory.map((item: any, index: number) => (
                          <StyledTableRow key={index}>
                            <StyledTableCell>
                              {dayjs(item?.createdAt).format("DD MMM YYYY HH:mm A")}
                            </StyledTableCell>
                            <StyledTableCell>
                              {item?.user?.name?.toUpperCase() || item?.user?.username?.toUpperCase() || "N/A"}
                            </StyledTableCell>
                            <StyledTableCell>{item?.initialQuantity}</StyledTableCell>
                            <StyledTableCell sx={{ color: item?.operation === "add" ? "green" : "red", fontWeight: 700 }}>
                              {item?.operation?.toUpperCase()}
                            </StyledTableCell>
                            <StyledTableCell>{item?.addedQuantity}</StyledTableCell>
                            <StyledTableCell>
                              {item?.operation === "add"
                                ? item?.initialQuantity + item?.addedQuantity
                                : item?.initialQuantity - item?.addedQuantity}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[]}
                  component="div"
                  count={shopProductStockHistoryTotal}
                  rowsPerPage={50}
                  page={shopProductStockHistoryPage}
                  onPageChange={(e, newPage) => setShopProductStockHistoryPage(newPage)}
                />
              </Paper>

            </>
          )}
        </Box>
      </Box >
    </>
  );
}
