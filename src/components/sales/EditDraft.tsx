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
import { useReactToPrint } from "react-to-print";
import SaleRecieptPDF from "./SaleReciept";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: 12,
        padding: "2px 8px",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 12,
        padding: "2px 8px",
    },
}));

const StyledTotalTableCell = styled(TableCell)(({ theme }) => ({
    padding: "2px 8px",
    fontSize: 12,
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
    quantity: number;
    available_stock: number;
};

function EditDraftPage({ draftId, handleGoToDrafts }: { draftId: string | null, handleGoToDrafts: () => void }) {
    const theme = useTheme()
    const router = useRouter();
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
    const [printingData, setPrintingData] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const menuRef = useRef(null);
    const handleMenuClick = () => {
        setAnchorEl(menuRef.current);
    };

    useEffect(() => {
        handleMenuClick()
    }, [])

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    useEffect(() => {
        if (printingData) {
            handlePrint();
            // Optionally clear printing data after a delay or success
            // setPrintingData(null);
        }
    }, [printingData, handlePrint]);


    const fetchOrderData = async () => {
        setProducts([]);

        try {
            const orderResponse = await getSaleById(draftId as string)
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
        if (draftId === undefined) return
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
    // useEffect(() => {
    //     if (orderDetails === undefined) return
    //     fetchProductsData();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [orderDetails]);

    const handleSelectProductChange = (
        event: SyntheticEvent<Element, Event>,
        value: any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<any> | undefined
    ) => {
        console.log(value, reason, details);
        if (reason === "clear") {
            setSelectedProduct(null);
            return;
        }
        if (value === null) {
            setSelectedProduct(null);
            return;
        }
        setSelectedProduct({ ...value, shopProductId: value._id, total_amount: 0, qty: 0, profit: 0 });
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


    console.log("orderProducts >>>>>>>>", orderProducts)
    console.log("old orderDetails >>>>>>>>", orderDetails)
    const Submit = async (e: any, shouldPrint: boolean = false, status: string = ORDER_STATUS.DELIVERED) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                total_amount: generateOrderTotalAmount(),
                profit: generateOrderProfit(),
                discount: +discount,
                sub_total: generateOrderSubTotalAmount(),
                status: status,
                updatedBy: [
                    ...(orderDetails.updatedBy || []),
                    ...(currentUser?._id ? [currentUser._id] : []),
                ],
                // shopId: currentUser?.assignedShop?._id as string,
            };
            const orderResponse = await updateSale({ saleId: orderDetails._id, saleData: orderData })
            console.log("updateSale orderResponse", orderResponse)
            // if (!orderResponse.success) {
            //     showAlert({
            //         title: "Error",
            //         text: orderResponse?.message || "An error occurred!",
            //         severity: "error"
            //     })
            //     return
            // }


            await deleteSalesItems(orderDetails.salesItems)

            // add order items
            // orderId, productId, quantity, totalAmount
            // item.productId, item.quantity, item.totalAmount
            // posOrderItems
            const items: any[] = []
            console.log("orderProducts >>>>>>>>", orderProducts)
            for (const item of orderProducts) {
                items.push({
                    ...item,
                    // shopProductId: item.shopProductId,
                    // productId: item.product._id,
                    // total_amount: item.total_amount,
                    product: { name: item?.product?.name || "N/A" },
                    unit_price: item?.product?.sellingPrice,
                    // profit: item.profit,
                    // qty: item.qty,
                    createdBy: currentUser?._id || ""
                })
            }
            console.log("addSalesItems>>>>", items)
            const orderItemsResponse = await addSalesItems({ saleId: orderResponse?.data?._id as string, salesItems: items })
            console.log("addSalesItems orderItemsResponse", orderItemsResponse)

            // if (!orderItemsResponse.success) {
            //     showAlert({
            //         title: "Error",
            //         text: orderItemsResponse?.message || "An error occurred!",
            //         severity: "error"
            //     })
            //     return
            // }

            if (shouldPrint) {

                const fullOrderData = {
                    ...orderResponse.data,
                    salesItems: items,
                    shopId: {
                        name: orderDetails?.shopId?.name || "N/A",
                        // tin: (currentUser?.assignedShop as any)?.tin,
                        // tel: (currentUser?.assignedShop as any)?.tel
                    },
                    createdBy: { name: orderDetails?.createdBy?.name || "N/A" }
                };
                setPrintingData(fullOrderData);
                // setHideAllButton(true);
                // return
            }

            showAlert({
                title: "Success",
                text: "Sales updated successfully",
                severity: "success",
                handleConfirmButtonClick() {
                    // router.back()
                    // reload page
                    window.location.reload();
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
            {/* Hidden Receipt for Printing */}
            <Box sx={{ display: "none" }}>
                {printingData && (
                    <div ref={componentRef}>
                        <SaleRecieptPDF orderData={printingData} />
                    </div>
                )}
            </Box>

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
                        Edit Draft Sale
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
                        Sales Number: {orderDetails?.salesNumber}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                        <form onSubmit={Submit}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <ShoppingCartIcon color="primary" fontSize="small" />
                                    <Typography variant="body2" fontWeight="600">
                                        Sale Details
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                                        Select Product
                                    </Typography>
                                    <Autocomplete
                                        fullWidth
                                        id="edit-order-select-product"
                                        options={products?.filter((item: any) => !selectOrderProductsSKU?.includes(item?._id)) || []}
                                        renderOption={(prop, option: any) => (
                                            <li {...prop} key={option._id}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", py: 0.5 }}>
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography variant="caption" fontWeight="600" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {option?.product?.name?.toUpperCase()}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{
                                                            bgcolor: option?.quantity > 0 ? "success.light" : "error.light",
                                                            color: option?.quantity > 0 ? "success.main" : "error.main",
                                                            borderRadius: 0.5, ml: 1
                                                        }}>
                                                            Stock: {option?.quantity}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" fontWeight="bold" color="primary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
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
                                            <TextField {...params} placeholder="Search product..." variant="outlined" />
                                        )}
                                    />
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={12}>
                                        <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                                            Quantity
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Enter quantity"
                                            value={selectedProduct?.qty || ""}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
                                            placeholder="Enter discount"
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            value={discount}
                                            onChange={(e) => {
                                                if (+e.target.value < 0 || isNaN(+e.target.value)) return;
                                                setDiscount(e.target.value);
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                                    <Button fullWidth variant="outlined" onClick={handleGoToDrafts} sx={{ py: 1.5, borderRadius: 2 }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        disabled={loading || !orderProducts?.length}
                                        sx={{ py: 1.5, borderRadius: 2, boxShadow: 2 }}
                                    >
                                        Save Changes
                                    </Button>
                                </Box> */}

                                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"

                                        onClick={handleGoToDrafts}
                                        sx={{ p: 0.2, borderRadius: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="button"
                                        disabled={loading || !orderProducts?.length}
                                        onClick={(e) => Submit(e, false, ORDER_STATUS.DELIVERED)}
                                        sx={{ p: 0.2, borderRadius: 2, boxShadow: 2 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="warning"
                                        type="button"
                                        disabled={loading || !orderProducts?.length}
                                        onClick={(e) => Submit(e, false, ORDER_STATUS.DRAFT)}
                                        sx={{ p: 0.2, borderRadius: 2, boxShadow: 2 }}
                                    >
                                        Save as draft
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        type="button"
                                        disabled={loading || !orderProducts?.length}
                                        onClick={(e) => Submit(e, true, ORDER_STATUS.DELIVERED)}
                                        sx={{ p: 0.2, borderRadius: 2, boxShadow: 2, fontSize: "0.8rem" }}
                                    >
                                        Save & Print
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
                            <Typography variant="subtitle1" fontWeight="bold">
                                Sale Items ({orderProducts?.length || 0})
                            </Typography>
                        </Box>
                        <TableContainer sx={{ minHeight: { xs: 200, md: 300 }, overflowX: "auto" }}>
                            <Table aria-label="selected products table" sx={{ minWidth: { xs: 450, md: "100%" } }}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Product</StyledTableCell>
                                        <StyledTableCell align="center">Qty</StyledTableCell>
                                        <StyledTableCell align="right">Unit Price</StyledTableCell>
                                        <StyledTableCell align="right">Total</StyledTableCell>
                                        <StyledTableCell align="center">Action</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary">No products selected yet</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {orderProducts.map((product) => (
                                                <StyledTableRow key={product._id}>
                                                    <StyledTableCell>
                                                        <Typography variant="caption" fontWeight="600">
                                                            {product?.product?.name?.toUpperCase()}
                                                        </Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center">{product.qty}</StyledTableCell>
                                                    <StyledTableCell align="right">{currencyFormatter(product?.product?.sellingPrice)}</StyledTableCell>
                                                    <StyledTableCell align="right" sx={{ fontWeight: "bold" }}>{currencyFormatter(product.total_amount)}</StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
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
                                                                            selectedProduct !== product.shopProductId
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                            <TableRow>
                                                <StyledTotalTableCell colSpan={3} align="right">Sub Total</StyledTotalTableCell>
                                                <StyledTotalTableCell align="right">{currencyFormatter(generateOrderSubTotalAmount())}</StyledTotalTableCell>
                                                <StyledTotalTableCell />
                                            </TableRow>
                                            <TableRow>
                                                <StyledTotalTableCell colSpan={3} align="right">Discount</StyledTotalTableCell>
                                                <StyledTotalTableCell align="right" sx={{ color: "error.main" }}>- {currencyFormatter(+discount)}</StyledTotalTableCell>
                                                <StyledTotalTableCell />
                                            </TableRow>
                                            <TableRow>
                                                <StyledTotalTableCell colSpan={3} align="right">
                                                    <Typography fontWeight="bold" color="primary">Total</Typography>
                                                </StyledTotalTableCell>
                                                <StyledTotalTableCell align="right">
                                                    <Typography fontWeight="bold" color="primary">
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

export default EditDraftPage;
