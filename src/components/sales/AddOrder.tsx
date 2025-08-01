import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  ListItem,
  Menu,
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
import { InferType, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled, useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "../Alerts";
import { ORDER_STATUS } from "@/types/constants";
import LoadingAlert from "../LoadingAlert";
import { currencyFormatter } from "@/utils/services/utils";
import { getAllShopProducts } from "@/utils/serverActions/ShopProduct";
import { addSalesItems } from "@/utils/serverActions/SalesItem";
import { addNewSale } from "@/utils/serverActions/Sale";


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
  // const form = useForm({
  //   defaultValues: {
  //     //   receiverAccountNumber: "",
  //     //   saveBeneficiary: false,
  //     //   selectedExistingBeneficiary: "placeholder",
  //     //   amount: 0.0,
  //     //   reference: "",
  //   },
  //   resolver: yupResolver(schema),
  //   mode: "all",
  // });

  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   reset,
  //   formState: { errors, isDirty, isValid },
  //   // control,
  //   setValue,
  // } = form;


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


      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Card>
            <form
              onSubmit={Submit}
              // noValidate
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "10px 20px",
              }}
            >
              <Typography fontWeight="bold">Create New Sale</Typography>

              <Grid container spacing={1}>

                {/* Select products */}
                {/* <Grid size={12}>
                  <Typography
                    variant="body1"
                    gutterBottom
                    fontWeight={"bold"}
                  >
                    Select products{" "}
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
                </Grid> */}
                <Grid
                  container
                  size={12}
                  spacing={2}
                  alignItems={"flex-end"}
                >
                  <Grid size={{ xs: 12, sm: 12, md: 7 }}>
                    <Box>
                      <Typography gutterBottom>Product</Typography>
                      <Autocomplete
                        // multiple
                        fullWidth
                        id="add-order-select-product"
                        options={
                          products?.filter(
                            (item: any) =>
                              !selectOrderProductsSKU?.includes(
                                item?._id
                              )
                          ) || []
                        }
                        renderOption={(prop, option: any) => (
                          <li {...prop} key={option._id}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                // alignItems: "center",
                                width: "100%",
                                // gap: "5px",
                              }}
                            >

                              <Typography variant="caption" fontSize={12}>{option?.product?.name?.toUpperCase()}</Typography>
                              <Box display={"flex"} flexDirection={"column"}>
                                <Typography variant="caption" fontWeight={"bold"} fontSize={8}>
                                  Stock: {option?.quantity}
                                </Typography>
                                <Typography variant="caption" fontWeight={"bold"} fontSize={8}>
                                  {currencyFormatter(option?.product?.sellingPrice)}
                                </Typography>
                              </Box>
                            </Box>
                          </li>
                        )}
                        onChange={handleSelectProductChange}
                        filterSelectedOptions
                        autoFocus={false}
                        sx={{
                          border: "1px solid #ABB3BF",
                        }}
                        getOptionLabel={(option: any) => option?.product?.name?.toUpperCase() || ""}
                        value={selectedProduct}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="product"

                            inputProps={{
                              ...params.inputProps,
                              style: {
                                border: "none",
                                padding: "2px 10px",
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  {/* Quantity */}
                  <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                    <Box>
                      <Typography gutterBottom>Quantity</Typography>
                      <TextField
                        type="number"
                        fullWidth
                        variant="standard"
                        placeholder="Enter quantity"
                        value={selectedProduct?.qty || ""}
                        onChange={(e) => {
                          // console.log(e.target.value);
                          if (+e.target.value < 0 || isNaN(+e.target.value)) {
                            return;
                          }
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
                            style: {
                              border: "2px solid #ABB3BF",
                              padding: "10px",
                              // paddingTop: "17px",
                              borderRadius: "5px",
                            },
                          },
                        }}

                      />
                    </Box>
                  </Grid>
                  <Grid size={2}>
                    <Button
                      variant="contained"
                      color="success"
                      disableElevation
                      size="small"
                      onClick={handleAddProduct}
                    >
                      Add
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Box>
                      <Typography gutterBottom>Discount</Typography>
                      <TextField
                        type="number"
                        fullWidth
                        variant="standard"
                        placeholder="Enter discount"
                        value={discount}
                        onChange={(e) => {
                          // console.log(e.target.value);
                          if (+e.target.value < 0 || isNaN(+e.target.value)) {
                            return;
                          }
                          setDiscount(e.target.value)
                        }}
                        slotProps={{
                          htmlInput: {
                            style: {
                              border: "2px solid #ABB3BF",
                              padding: "10px",
                              // paddingTop: "17px",
                              borderRadius: "5px",
                            },
                          },
                        }}

                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              {/* Buttons */}
              <Box display="flex" gap={1} justifyContent={"flex-end"}>
                <Button
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ width: "fit-content" }}
                  disabled={
                    // !isDirty ||
                    // !isValid ||
                    loading ||
                    !orderProducts ||
                    orderProducts?.length === 0
                  }
                >
                  Save
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>
        {/* Selected products */}
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Card>
            <Typography
              variant="body1"
              gutterBottom
              fontWeight={"bold"}
              sx={{ padding: "10px" }}
            >
              Selected products
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 250 }} aria-label="simple table">
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>Product</StyledTableCell>
                    <StyledTableCell align="center">Qty.</StyledTableCell>
                    <StyledTableCell align="center">
                      Unit Price
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      Total Price
                    </StyledTableCell>
                    <StyledTableCell align="center"></StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {orderProducts?.map((product) => (
                    <StyledTableRow
                      key={product._id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <StyledTableCell>{product?.product?.name?.toUpperCase()}</StyledTableCell>
                      <StyledTableCell align="center">
                        {product.qty}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {product?.product?.sellingPrice}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {product.total_amount}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <IconButton
                          onClick={() => {
                            setOrderProducts((prev: any) =>
                              prev.filter(
                                (selectedProduct: any) =>
                                  selectedProduct?._id !==
                                  product._id
                              )
                            );
                            setSelectedOrderProductsSKU((prev: number[]) =>
                              prev.filter(
                                (selectedProduct: number) =>
                                  selectedProduct !== product._id
                              )
                            );
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  {orderProducts?.length !== 0 && (
                    <>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTotalTableCell
                          colSpan={3}
                          align="right"
                        // sx={{ fontSize: "10px" }}
                        >
                          Sub Total
                        </StyledTotalTableCell>
                        <StyledTotalTableCell
                          colSpan={1}
                          align="center"
                        // sx={{ fontSize: "10px" }}
                        >
                          {currencyFormatter(generateOrderSubTotalAmount())}
                        </StyledTotalTableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTotalTableCell
                          colSpan={3}
                          align="right"
                        >
                          Discount
                        </StyledTotalTableCell>
                        <StyledTotalTableCell
                          colSpan={1}
                          align="center"
                        >
                          {currencyFormatter(+discount)}
                        </StyledTotalTableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTotalTableCell
                          colSpan={3}
                          align="right"
                        >
                          Total
                        </StyledTotalTableCell>
                        <StyledTotalTableCell
                          colSpan={1}
                          align="center"
                        >
                          {currencyFormatter(generateOrderTotalAmount())}
                        </StyledTotalTableCell>
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
