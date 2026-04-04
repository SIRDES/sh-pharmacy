"use client"

import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  ListItem,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { SyntheticEvent, use, useEffect, useRef, useState } from "react";
import { InferType, object, string } from "yup";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { styled, useTheme, alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/Alerts";
import { ORDER_STATUS } from "@/types/constants";
import LoadingAlert from "@/components/LoadingAlert";
import { currencyFormatter } from "@/utils/services/utils";
import { getSaleById, updateSale } from "@/utils/serverActions/Sale";
import { getAllShopProducts } from "@/utils/serverActions/ShopProduct";
import { addSalesItems, deleteSalesItems } from "@/utils/serverActions/SalesItem";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "6px 4px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 12,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTotalTableCell = styled(TableCell)(({ theme }) => ({
  padding: "6px 4px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 12,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontWeight: "bold",
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  // "&:hover": {
  //   cursor: "pointer",
  // },
}));
// const schema = object().shape({
//   customerName: string().required("Customer name is required"),
//   customerPhoneNumber: string().required("Phone number is required"),
//   customerAddress: string().required("Customer address is required")
// });

// type FormData = InferType<typeof schema>;

type ProductType = {
  id: string;
  name: string;
  price: number;
  // image: string;
  quantity: number;
  available_stock: number;
};
type OrderProductType = ProductType & {
  quantity: number;
  totalAmount: number;
};

function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const theme = useTheme()
  const router = useRouter();
  const { id } = use(params)
  const { data: session } = useSession()
  const currentUser = session?.user
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [orderProducts, setOrderProducts] = useState<Array<any>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectOrderProductsSKU, setSelectedOrderProductsSKU] = useState<
    Array<number>
  >([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [discount, setDiscount] = useState("")

  const menuRef = useRef(null);
  const handleMenuClick = () => {
    setAnchorEl(menuRef.current);
  };

  useEffect(() => {
    handleMenuClick()
  }, [])
  const fetchOrderData = async () => {
    setProducts([]);

    try {
      const orderResponse = await getSaleById(id as string)
      console.log("orderResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred!",
          severity: "error"
        })
        return
      }
      console.log("draft Order details", orderResponse?.data)
      setOrderDetails(orderResponse?.data);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message ||
          error.data ||
          "An error occurred",
        severity: "error"
      })
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id === undefined) return
    fetchOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(orderDetails).length > 0) {
      console.log("data", orderDetails);
      const items = []
      for (const item of orderDetails?.salesItems) {
        items.push({ ...item })
      }
      setOrderProducts(items);
      setDiscount(orderDetails?.discount || "")
      setSelectedOrderProductsSKU(
        orderDetails?.salesItems?.map((product: any) => product?.shopProductId) || []
      );
      fetchProductsData();
    }
    // eslint-disable-next-line
  }, [orderDetails]);

  const fetchProductsData = async () => {
    setProducts([]);

    try {
      const res = await getAllShopProducts({ shopId: orderDetails?.shopId?._id })
      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occured",
          severity: "error"
        })
        return
      }
      // console.log("all products", res?.data)
      setProducts(res?.data);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occured",
        severity: "error"
      })
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   if (orderDetails === undefined) return
  //   fetchProductsData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleSelectProductChange = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    // console.log(value, reason, details);
    if (reason === "clear") {
      setSelectedProduct(null);
      return;
    }
    if (value === null) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct({ ...value, total_amount: 0, qty: 0, profilt: 0 });
  };
  const handleAddProduct = () => {
    console.log("selectedProduct", selectedProduct)
    if (
      selectedProduct === null ||
      !selectedProduct.quantity ||
      +selectedProduct.qty < 1
    ) {
      showAlert({
        title: "Error",
        text: "Please select a product and enter quantity greater than 0 first",
        severity: "error"
      })
      return;
    }
    if (selectedProduct.qty > selectedProduct.quantity) {
      showAlert({
        title: "Error",
        text: "Quantity cannot be greater than available stock",
        severity: "error"
      })
      return;
    }
    // console.log("selectedProduct", selectedProduct)
    setOrderProducts((prev: any) => [...prev, selectedProduct]);
    setSelectedOrderProductsSKU((prev: number[]) => [
      ...prev,
      selectedProduct?._id,
    ]);
    setSelectedProduct(null);
  };

  const generateOrderSubTotalAmount = () => {
    let total = 0;
    orderProducts?.forEach((product: any) => {
      total += product?.total_amount;
    });
    return total;
  };
  const generateOrderTotalAmount = () => {
    let total = 0;
    let discountValue = +discount
    orderProducts?.forEach((product: any) => {
      total += product?.total_amount;
    });
    if (total > 0 && discountValue > 0 && discountValue <= total) {
      total -= discountValue
    }
    return total;
  };
  const generateOrderProfit = () => {
    let total = 0;
    let discountValue = +discount
    orderProducts?.forEach((product: any) => {
      total += product?.profit;
    });
    if (total > 0 && discountValue > 0 && discountValue <= total) {
      total -= discountValue
    }
    return total;
  };

  const Submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {

      // console.log("orderProducts", orderProducts)


      // add order
      // order.customerId, order.total_amount, order.subtotal_amount, order.status, order.createdBy

      const orderData = {
        total_amount: generateOrderTotalAmount(),
        profit: generateOrderProfit(),
        discount: +discount,
        sub_total: generateOrderSubTotalAmount(),
        updatedBy: [
          ...(orderDetails.updatedBy || []),
          ...(currentUser?._id ? [currentUser._id] : []),
        ],
        // shopId: currentUser?.assignedShop?._id as string,
      };
      const orderResponse = await updateSale({ saleId: orderDetails._id, saleData: orderData })
      // console.log("orderResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred!",
          severity: "error"
        })
        return
      }


      const deletePrevsalesItemsRes = await deleteSalesItems(orderDetails.salesItems)
      // console.log("deletePrevsalesItemsRes", deletePrevsalesItemsRes)

      // add order items
      // orderId, productId, quantity, totalAmount
      // item.productId, item.quantity, item.totalAmount
      // posOrderItems
      const items: any[] = []
      for (const item of orderProducts) {
        items.push({
          shopProductId: item._id,
          productId: item.product._id,
          total_amount: item.total_amount,
          unit_price: item?.product?.sellingPrice,
          profit: item.profit,
          qty: item.qty,
          createdBy: currentUser?._id || ""
        })
      }
      // console.log("addSalesItems>>>>", items)
      const orderItemsResponse = await addSalesItems({ saleId: orderResponse?.data?._id as string, salesItems: items })
      // console.log("orderItemsResponse", orderItemsResponse)

      if (!orderItemsResponse.success) {
        showAlert({
          title: "Error",
          text: orderItemsResponse?.message || "An error occurred!",
          severity: "error"
        })
        return
      }

      showAlert({
        title: "Success",
        text: "Order created successfully",
        severity: "success",
        handleConfirmButtonClick() {
          router.back()
        },
      })
    } catch (error: unknown) {
      // Generic error handling
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred, please try again";
      console.error("Add order error:", error);

      showAlert({
        title: "Error",
        text: errorMessage,
        severity: "error"
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <LoadingAlert open={loading} />

      {/* Page Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { bgcolor: "grey.100" }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: "1.0rem", md: "1.1rem" } }}>
            Edit Sale
          </Typography>
          {/* <Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
            Order ID: {orderDetails?.orderId || id}
          </Typography> */}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Product Selection */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            overflow: "visible",
            border: "1px solid",
            borderColor: "divider"
          }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ShoppingCartIcon color="primary" fontSize="small" />
                <Typography variant="body2" fontWeight="600">Add Products</Typography>
              </Box>

              <form onSubmit={Submit}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                      Select Product <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <Autocomplete
                      fullWidth
                      id="add-order-select-product"
                      options={
                        products?.filter(
                          (item: any) => !selectOrderProductsSKU?.includes(item?._id)
                        ) || []
                      }
                      renderOption={(prop, option: any) => (
                        <li {...prop} key={option._id}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", py: 0.5 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="caption" fontWeight="600">
                                {option?.product?.name?.toUpperCase()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  bgcolor: option?.quantity > 0 ? "success.light" : "error.light",
                                  color: option?.quantity > 0 ? "success.main" : "error.main",
                                  px: 1,
                                  borderRadius: 1,
                                  fontWeight: 'bold'
                                }}
                              >
                                {" "}Stock: {option?.quantity}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>

                              <Typography variant="caption" color="text.secondary">
                                Price: {currencyFormatter(option?.product?.sellingPrice)}
                              </Typography>
                            </Box>
                          </Box>
                        </li>
                      )}
                      onChange={handleSelectProductChange}
                      getOptionLabel={(option: any) => option?.product?.name?.toUpperCase() || ""}
                      value={selectedProduct}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search product..."
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Grid container spacing={2}>
                      <Grid size={8}>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                          Quantity
                        </Typography>
                        <TextField
                          type="number"
                          fullWidth
                          placeholder="0"
                          value={selectedProduct?.qty || ""}
                          onChange={(e) => {
                            if (+e.target.value < 0 || isNaN(+e.target.value)) return;
                            setSelectedProduct((prev: any) => {
                              if (!prev) return null;
                              const totalSellingPrice = +e.target.value * +prev?.product?.sellingPrice;
                              const totalCostPrice = +e.target.value * +prev?.product?.costPrice;
                              return {
                                ...prev,
                                qty: +e.target.value,
                                total_amount: totalSellingPrice,
                                profit: totalSellingPrice - totalCostPrice
                              };
                            });
                          }}
                          slotProps={{
                            htmlInput: {
                              style: { padding: '12px 14px' }
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          disableElevation
                          startIcon={<AddIcon />}
                          onClick={handleAddProduct}
                          sx={{ height: '48px', borderRadius: 2 }}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <LocalOfferIcon fontSize="small" color="secondary" />
                      <Typography variant="body2" fontWeight="600">Discount (GHS)</Typography>
                    </Box>
                    <TextField
                      type="number"
                      fullWidth
                      placeholder="0.00"
                      value={discount}
                      onChange={(e) => {
                        if (+e.target.value < 0 || isNaN(+e.target.value)) return;
                        setDiscount(e.target.value)
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => router.back()}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading || !orderProducts?.length}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </form>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Selected Products & Summary */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column"
          }}>
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLongIcon color="primary" />
              <Typography variant="h6" fontWeight="600">Order Items</Typography>
              <Box sx={{ ml: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', px: 2, py: 0.5, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="700">
                  {orderProducts?.length} {orderProducts?.length === 1 ? 'Item' : 'Items'}
                </Typography>
              </Box>
            </Box>

            <TableContainer sx={{ flexGrow: 1 }}>
              <Table aria-label="selected products table">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <StyledTableCell sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'transparent' }}>Product</StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'transparent' }}>Qty</StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'transparent' }}>Unit Price</StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'transparent' }}>Total</StyledTableCell>
                    <StyledTableCell align="right" sx={{ bgcolor: 'transparent' }}></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderProducts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No products selected yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderProducts.map((product) => (
                      <TableRow key={product._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <StyledTableCell>
                          <Typography variant="body2" fontWeight="600">
                            {product?.product?.name?.toUpperCase()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Box sx={{ bgcolor: 'grey.100', display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="700">{product.qty}</Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {currencyFormatter(product?.product?.sellingPrice)}
                        </StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {currencyFormatter(product.total_amount)}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setOrderProducts((prev: any) =>
                                prev.filter((sp: any) => sp?._id !== product._id)
                              );
                              setSelectedOrderProductsSKU((prev: number[]) =>
                                prev.filter((sku: number) => sku !== product.shopProductId)
                              );
                            }}
                            sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </StyledTableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Section */}
            {orderProducts?.length > 0 && (
              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), borderTop: '1px dashed', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Sub-total</Typography>
                    <Typography fontWeight="600">{currencyFormatter(generateOrderSubTotalAmount())}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Discount</Typography>
                    <Typography color="error.main" fontWeight="600">-{currencyFormatter(+discount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="700">Total</Typography>
                    <Typography variant="h5" fontWeight="800" color="primary">
                      {currencyFormatter(generateOrderTotalAmount())}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EditSalePage;
