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
  InputAdornment,
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
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { styled, useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "../Alerts";
import LoadingAlert from "../LoadingAlert";
import { currencyFormatter } from "@/utils/services/utils";
import { getAllShopProducts } from "@/utils/serverActions/ShopProduct";
import { addSalesItems } from "@/utils/serverActions/SalesItem";
import { addNewSale } from "@/utils/serverActions/Sale";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: 13,
    padding: "12px 16px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: "12px 16px",
  },
}));

const StyledTotalTableCell = styled(TableCell)(({ theme }) => ({
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: "bold",
  borderBottom: "none",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  transition: theme.transitions.create("background-color"),
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

type ProductType = {
  id: string;
  name: string;
  price: number;
  // image: string;
  current_quantity: number;
  available_stock: number;
};
type OrderProductType = ProductType & {
  quantity: number;
  totalAmount: number;
};

function AddNewOrder() {
  const theme = useTheme()
  const router = useRouter();
  const { data: session } = useSession()
  const currentUser = session?.user
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [orderProducts, setOrderProducts] = useState<Array<any>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectOrderProductsSKU, setSelectedOrderProductsSKU] = useState<
    Array<number>
  >([]);
  const [discount, setDiscount] = useState("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuRef = useRef(null);
  const handleMenuClick = () => {
    setAnchorEl(menuRef.current);
  };

  useEffect(() => {
    handleMenuClick()
  }, [])
  const handleClose = () => {
    setAnchorEl(null);
  };


  const fetchProductsData = async () => {
    setProducts([]);

    try {
      const res = await getAllShopProducts({ shopId: currentUser?.assignedShop?._id })
      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occured",
          severity: "error"
        })
        return
      }
      console.log("all products", res?.data)
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
  useEffect(() => {
    fetchProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    try {
      // console.log("orderProducts", orderProducts)

      // add order
      const orderData = {
        total_amount: generateOrderTotalAmount(),
        profit: generateOrderProfit(),
        discount: +discount,
        sub_total: generateOrderSubTotalAmount(),
        createdBy: currentUser?._id || "",
        shopId: currentUser?.assignedShop?._id as string,
      };

      setLoading(true);
      const orderResponse = await addNewSale({ ...orderData })
      // console.log("orderResponse", orderResponse)
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          text: orderResponse?.message || "An error occurred!",
          severity: "error"
        })
        return
      }

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

      const orderItemsResponse = await addSalesItems({ saleId: orderResponse?.data?._id as string, salesItems: items })
      console.log("orderItemsResponse", orderItemsResponse)

      // update stock
      if (!orderItemsResponse.success) {
        showAlert({
          title: "Error",
          text: orderItemsResponse?.message || "An error occurred!",
          severity: "error"
        })
        return
      }

      setOrderProducts([]);
      setSelectedOrderProductsSKU([]);
      setSelectedProduct(null);

      showAlert({
        title: "Success",
        text: "Sales saved successfully",
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
      // console.error("Add order error:", error);
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
    <Box>
      <LoadingAlert open={loading} />

      <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 1, md: 2 }, gap: { xs: 1.5, md: 2 } }}>
        {/* <IconButton onClick={() => router.back()} sx={{ bgcolor: "background.paper", boxShadow: 1, p: { xs: 0.5, md: 1 } }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton> */}
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: "1.0rem", md: "1.1rem" } }}>
          Create New Sale
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <form onSubmit={Submit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShoppingCartIcon color="primary" sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }} />
                  <Typography variant="h6" fontWeight="600" sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
                    Sales Details
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                    Select Product
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
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", py: 0.5 }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight="600" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {option?.product?.name?.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Stock: {option?.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
                            {currencyFormatter(option?.product?.sellingPrice)}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    onChange={handleSelectProductChange}
                    filterSelectedOptions
                    getOptionLabel={(option: any) => option?.product?.name?.toUpperCase() || ""}
                    value={selectedProduct}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search for a product..."
                        variant="outlined"
                      />
                    )}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                      Quantity
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter quantity"
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
                            profit: totalSellingPrice - totalCostPrice,
                          };
                        });
                      }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      sx={{ py: 1.2, borderRadius: 2, boxShadow: 1 }}
                    >
                      Add to List
                    </Button>
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                      Discount
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter discount amount"
                      value={discount}
                      onChange={(e) => {
                        if (+e.target.value < 0 || isNaN(+e.target.value)) return;
                        setDiscount(e.target.value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOfferIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => router.back()}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading || !orderProducts?.length}
                    sx={{ py: 1.5, borderRadius: 2, boxShadow: 2 }}
                  >
                    Complete Sale
                  </Button>
                </Box>
              </Box>
            </form>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
              <ShoppingCartIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                Selected Products ({orderProducts?.length || 0})
              </Typography>
            </Box>
            <TableContainer sx={{ minHeight: { xs: 200, md: 300 }, overflowX: "auto" }}>
              <Table aria-label="simple table" sx={{ minWidth: { xs: 450, md: "100%" } }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product</StyledTableCell>
                    <StyledTableCell align="center">Qty</StyledTableCell>
                    <StyledTableCell align="right" sx={{ whiteSpace: "nowrap" }}>Unit Price</StyledTableCell>
                    <StyledTableCell align="right">Total</StyledTableCell>
                    <StyledTableCell align="center">Action</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No products selected yet.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {orderProducts.map((product) => (
                        <StyledTableRow key={product._id}>
                          <StyledTableCell>
                            <Typography variant="body2" fontWeight="600">
                              {product?.product?.name?.toUpperCase()}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="center">{product.qty}</StyledTableCell>
                          <StyledTableCell align="right">
                            {currencyFormatter(product?.product?.sellingPrice)}
                          </StyledTableCell>
                          <StyledTableCell align="right" sx={{ fontWeight: "bold" }}>
                            {currencyFormatter(product.total_amount)}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setOrderProducts((prev: any) =>
                                  prev.filter((p: any) => p._id !== product._id)
                                );
                                setSelectedOrderProductsSKU((prev: any) =>
                                  prev.filter((id: any) => id !== product._id)
                                );
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                      <TableRow>
                        <StyledTotalTableCell colSpan={3} align="right">
                          Sub Total
                        </StyledTotalTableCell>
                        <StyledTotalTableCell align="right">
                          {currencyFormatter(generateOrderSubTotalAmount())}
                        </StyledTotalTableCell>
                        <StyledTotalTableCell />
                      </TableRow>
                      <TableRow>
                        <StyledTotalTableCell colSpan={3} align="right">
                          Discount
                        </StyledTotalTableCell>
                        <StyledTotalTableCell align="right" sx={{ color: "error.main" }}>
                          - {currencyFormatter(+discount)}
                        </StyledTotalTableCell>
                        <StyledTotalTableCell />
                      </TableRow>
                      <TableRow>
                        <StyledTotalTableCell colSpan={3} align="right">
                          <Typography variant="h6" fontWeight="bold">Total</Typography>
                        </StyledTotalTableCell>
                        <StyledTotalTableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {currencyFormatter(generateOrderTotalAmount())}
                          </Typography>
                        </StyledTotalTableCell>
                        <StyledTotalTableCell />
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddNewOrder;
