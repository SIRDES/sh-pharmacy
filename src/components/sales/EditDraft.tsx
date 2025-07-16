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
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { InferType, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import DeleteIcon from "@mui/icons-material/Delete";

import LoadingAlert from "../LoadingAlert";
import { styled, useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "../Alerts";
import { ORDER_STATUS } from "@/types/constants";
import { currencyFormatter } from "@/utils/services/utils";


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
const schema = object().shape({
    customerName: string().required("Customer name is required"),
    customerPhoneNumber: string().required("Phone number is required"),
    customerAddress: string().required("Customer address is required")
});

type FormData = InferType<typeof schema>;

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

function EditDraft({ draftId, handleGoToDrafts }: { draftId: number | null, handleGoToDrafts: () => void }) {
    const theme = useTheme()
    const router = useRouter();
    const { data: session } = useSession()
    const currentUser = session?.user
    const posProducts = (window as any)?.pos?.products
    const posCustomers = (window as any)?.pos?.customers
    const posOrders = (window as any)?.pos?.orders
    const posOrderItems = (window as any)?.pos?.orderItems
    const [loading, setLoading] = useState(false);
    const [phoneNum, setPhoneNum] = useState("");
    const [products, setProducts] = useState([]);
    const [orderDetails, setOrderDetails] = useState<any>({});
    const [orderProducts, setOrderProducts] = useState<Array<any>>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchedCustomers, setSearchedCustomers] = useState<any>(null);
    const [selectOrderProductsSKU, setSelectedOrderProductsSKU] = useState<
        Array<number>
    >([]);
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
    const form = useForm({
        defaultValues: {
            //   receiverAccountNumber: "",
            //   saveBeneficiary: false,
            //   selectedExistingBeneficiary: "placeholder",
            //   amount: 0.0,
            //   reference: "",
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
    const fetchOrderData = async () => {
        setProducts([]);

        try {
            const res = await posOrders?.getOne(draftId)
            if (res?.status === "error") {
                showAlert({
                    title: "Error",
                    text: res?.message,
                    severity: "error"
                })

                return
            }
            console.log("draft Order details", res?.data)
            setOrderDetails(res?.data);
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
        if (draftId === null) return
        fetchOrderData();
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftId]);

    useEffect(() => {
        if (Object.keys(orderDetails).length > 0) {
            console.log("data", orderDetails);

            setValue("customerName", orderDetails?.customer_name || "", {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            setValue("customerAddress", orderDetails?.customer_address || "", {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            setValue("customerPhoneNumber", orderDetails?.customer_phoneNumber || "", {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            setPhoneNum(orderDetails?.customer_phoneNumber || "");
            const items = []
            for (const item of orderDetails?.orderItems) {
                items.push({ ...item, price: item.product_price, total_amount: item.quantity * item.product_price, name: item.product_name })
            }
            setOrderProducts(items);
            setSelectedOrderProductsSKU(
                orderDetails?.orderItems?.map((product: any) => product.id) || []
            );
        }
        // eslint-disable-next-line
    }, [orderDetails]);



    const handleGetCustomerPhoneNumber = async (phoneNumber: string) => {
        console.log(phoneNumber)
        setSearchedCustomers([])
        if (phoneNumber === "") return
        try {
            const res = await posCustomers.getByPhoneNumber(phoneNumber)

            console.log("all SearchedCustomers res", res)
            console.log("all SearchedCustomers", res?.data)
            setSearchedCustomers(res?.data);
        } catch (error: any) {
            console.log("error", error);
        } finally {
            setLoading(false);
        }
    }
    const handleSelectCustomer = (customer: any) => {
        setValue("customerPhoneNumber", customer?.phoneNumber || "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setValue("customerName", customer?.name || "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setValue("customerAddress", customer?.address || "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setSearchedCustomers(null)
    }
    const fetchProductsData = async () => {
        setProducts([]);

        try {
            const res = await posProducts?.getAll()
            if (res?.status === "error") {
                showAlert({
                    title: "Error",
                    text: res?.message,
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
        fetchProductsData();
        // eslint-disable-next-line
    }, []);

    const handleSelectProductChange = (
        event: SyntheticEvent<Element, Event>,
        value: ProductType | null,
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
        setSelectedProduct({ ...value, total_amount: 0, quantity: 0 });
        // const list = selectedElectivesId;
        // value?.forEach((subject: any) => {
        //   list.push(subject.id);
        // });
        // setSelectedElectivesId(list);
    };
    const handleAddProduct = () => {
        if (
            selectedProduct === null ||
            !selectedProduct.current_quantity ||
            +selectedProduct.quantity < 1
        ) {
            showAlert({
                title: "Error",
                text: "Please select a product and enter quantity greater than 0 first",
                severity: "error"
            })
            return;
        }
        if (selectedProduct.quantity > selectedProduct.current_quantity) {
            showAlert({
                title: "Error",
                text: "Quantity cannot be greater than available stock",
                severity: "error"
            })
            return;
        }
        setOrderProducts((prev: any) => [...prev, selectedProduct]);
        setSelectedOrderProductsSKU((prev: number[]) => [
            ...prev,
            selectedProduct?.id,
        ]);
        setSelectedProduct(null);
    };

    const generateOrderTotalAmount = () => {
        let total = 0;
        orderProducts.forEach((product: any) => {
            total += product?.total_amount;
        });
        return total;
    };

    const SaveAsDraft = async () => {

        setLoading(true);

        try {

            const customerData = {
                id: orderDetails.customerId,
                name: watch("customerName"),
                phoneNumber: watch("customerPhoneNumber"),
                address: watch("customerAddress"),
            }


            console.log("orderProducts", orderProducts)

            // add customer if does not exist
            // name, phoneNumber, address
            const customerResponse = await posCustomers.edit(customerData)
            console.log("customerResponse", customerResponse)
            if (customerResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: customerResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }


            // add order
            // order.customerId, order.total_amount, order.subtotal_amount, order.status, order.createdBy
            // posOrders
            const orderData = {
                id: orderDetails.id,
                customerId: orderDetails.customerId,
                status: ORDER_STATUS.DRAFT,
                total_amount: generateOrderTotalAmount(),
                subtotal_amount: generateOrderTotalAmount(),
                updatedBy: currentUser?._id,
                // updatedBy: []
            };
            const orderResponse = await posOrders.edit(orderData)
            console.log("orderResponse", orderResponse)
            if (orderResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: orderResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }


            const deletePrevOrderItemsRes = await posOrderItems.delete(orderDetails.orderItems)
            console.log("deletePrevOrderItemsRes", deletePrevOrderItemsRes)

            // add order items
            // orderId, productId, quantity, totalAmount
            // item.productId, item.quantity, item.totalAmount
            // posOrderItems
            const items: any[] = []
            for (const item of orderProducts) {
                items.push({
                    productId: item.id,
                    quantity: item.quantity,
                    totalAmount: item.total_amount,
                })
            }

            const orderItemsResponse = await posOrderItems.add({ orderId: orderDetails.id, items })
            console.log("orderItemsResponse", orderItemsResponse)
            if (orderItemsResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: orderItemsResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }

            // update stock
            showAlert({
                title: "Success",
                text: "Order saved successfully",
                severity: "success"
            })

            reset();

            handleGoToDrafts()
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
    const Submit = async (dat: FormData) => {

        setLoading(true);

        try {

            const customerData = {
                id: orderDetails.customerId,
                name: dat.customerName,
                phoneNumber: dat.customerPhoneNumber,
                address: dat.customerAddress,
            }


            console.log("orderProducts", orderProducts)

            // add customer if does not exist
            // name, phoneNumber, address
            const customerResponse = await posCustomers.edit(customerData)
            console.log("customerResponse", customerResponse)
            if (customerResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: customerResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }


            // add order
            // order.customerId, order.total_amount, order.subtotal_amount, order.status, order.createdBy
            // posOrders
            const orderData = {
                id: orderDetails.id,
                customerId: orderDetails.customerId,
                status: ORDER_STATUS.DELIVERED,
                total_amount: generateOrderTotalAmount(),
                subtotal_amount: generateOrderTotalAmount(),
                updatedBy: currentUser?._id,
                // updatedBy: []
            };
            const orderResponse = await posOrders.edit(orderData)
            console.log("orderResponse", orderResponse)
            if (orderResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: orderResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }


            const deletePrevOrderItemsRes = await posOrderItems.delete(orderDetails.orderItems)
            console.log("deletePrevOrderItemsRes", deletePrevOrderItemsRes)

            // add order items
            // orderId, productId, quantity, totalAmount
            // item.productId, item.quantity, item.totalAmount
            // posOrderItems
            const items: any[] = []
            for (const item of orderProducts) {
                items.push({
                    productId: item.id,
                    quantity: item.quantity,
                    totalAmount: item.total_amount,
                })
            }

            const orderItemsResponse = await posOrderItems.add({ orderId: orderDetails.id, items })
            console.log("orderItemsResponse", orderItemsResponse)
            if (orderItemsResponse.status === "error") {
                showAlert({
                    title: "Error",
                    text: orderItemsResponse?.message || "An error occurred!",
                    severity: "error"
                })
                return
            }

            // update stock
            showAlert({
                title: "Success",
                text: "Order created successfully",
                severity: "success"
            })
            reset();

            handleGoToDrafts()
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
        <Box>
            <LoadingAlert open={loading} />

            <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <Card>
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
                            <Typography fontWeight="bold">Edit Order</Typography>

                            <Grid container spacing={1}>

                                {/* Customer's phone number */}
                                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                                    <Box sx={{ position: "relative" }}>
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
                                            placeholder="Enter customer phone number"
                                            inputProps={{
                                                style: {
                                                    border: "2px solid #ABB3BF",
                                                    padding: "10px",
                                                    // paddingTop: "17px",
                                                    borderRadius: "5px",
                                                },
                                            }}
                                            {...register("customerPhoneNumber", {
                                                required: true, onChange(event) {
                                                    handleGetCustomerPhoneNumber(event.target.value)
                                                },
                                            })}
                                        />
                                        <Typography color="error" variant="subtitle2">
                                            {errors.customerPhoneNumber?.message}
                                        </Typography>

                                        <Box>
                                            {searchedCustomers && searchedCustomers?.length > 0 && searchedCustomers?.map((customer: any, index: number) => (
                                                <ListItem key={customer?.id + index} sx={{
                                                    borderBottom: "1px solid #ccc",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: theme.palette.secondary.light,
                                                    },
                                                }}
                                                    onClick={() => handleSelectCustomer(customer)}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: "100%"
                                                        }}
                                                    >

                                                        <Box display={"flex"} justifyContent={"space-between"}>
                                                            <Typography variant="caption" fontWeight={"bold"} fontSize={10}>
                                                                {customer?.phoneNumber}
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight={"bold"} fontSize={10}>
                                                                {customer?.name}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" fontSize={12}>{customer?.address}</Typography>

                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                                {/* Customer name */}
                                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                                    <Box>
                                        <Typography gutterBottom>
                                            Customer Name{" "}
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
                                            placeholder="Enter customer name"
                                            inputProps={{
                                                style: {
                                                    border: "2px solid #ABB3BF",
                                                    padding: "10px",
                                                    // paddingTop: "17px",
                                                    borderRadius: "5px",
                                                },
                                            }}
                                            {...register("customerName", { required: true })}
                                        />
                                        <Typography color="error" variant="subtitle2">
                                            {errors.customerName?.message}
                                        </Typography>
                                    </Box>
                                </Grid>



                                {/* Customer address */}
                                <Grid size={12}>
                                    <Box>
                                        <Typography gutterBottom>
                                            Customer address{" "}
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
                                            multiline
                                            minRows={1}
                                            maxRows={3}
                                            placeholder="Enter customer address"
                                            inputProps={{
                                                style: {
                                                    border: "2px solid #ABB3BF",
                                                    padding: "10px",
                                                    // paddingTop: "17px",
                                                    borderRadius: "5px",
                                                },
                                            }}
                                            {...register("customerAddress", { required: true })}
                                        />
                                        <Typography color="error" variant="subtitle2">
                                            {errors.customerAddress?.message}
                                        </Typography>
                                    </Box>
                                </Grid>
                                {/* Select products */}
                                <Grid size={12}>
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
                                </Grid>
                                <Grid
                                    container
                                    size={12}
                                    spacing={2}
                                    alignItems={"flex-end"}
                                >
                                    <Grid size={7}>
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
                                                                item?.id
                                                            )
                                                    ) || []
                                                }
                                                renderOption={(prop, option: any) => (
                                                    <li {...prop} key={option.id}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                // alignItems: "center",
                                                                width: "100%",
                                                                // gap: "5px",
                                                            }}
                                                        >

                                                            <Typography variant="caption" fontSize={12}>{option?.name}</Typography>
                                                            <Box display={"flex"} flexDirection={"column"}>
                                                                <Typography variant="caption" fontWeight={"bold"} fontSize={8}>
                                                                    Stock: {option?.current_quantity}
                                                                </Typography>
                                                                <Typography variant="caption" fontWeight={"bold"} fontSize={8}>
                                                                    {currencyFormatter(option?.price)}
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
                                                getOptionLabel={(option: ProductType) => option.name}
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
                                                value={selectedProduct?.quantity || ""}
                                                onChange={(e) => {
                                                    console.log(e.target.value);
                                                    if (+e.target.value < 0 || isNaN(+e.target.value)) {
                                                        return;
                                                    }
                                                    setSelectedProduct((prev: any) => {
                                                        if (!prev) return null;
                                                        return {
                                                            ...prev,
                                                            quantity: +e.target.value,
                                                            total_amount: +e.target.value * +prev?.price,
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
                                            onClick={handleAddProduct}
                                        >
                                            Add
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* Buttons */}
                            <Box display="flex" gap={1} justifyContent={"flex-end"}>
                                <Button
                                    variant="outlined"
                                    sx={{ width: "fit-content" }}
                                    onClick={handleGoToDrafts}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    sx={{ width: "fit-content" }}
                                    disabled={
                                        loading ||
                                        !isDirty ||
                                        !isValid

                                    }
                                    onClick={SaveAsDraft}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    sx={{ width: "fit-content" }}
                                    disabled={
                                        !isDirty ||
                                        !isValid ||
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
                                            key={product.productSKU}
                                            sx={{
                                                "&:last-child td, &:last-child th": { border: 0 },
                                            }}
                                        >
                                            <StyledTableCell>{product.name}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                {product.quantity}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                {product.price}
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
                                                                    selectedProduct?.id !==
                                                                    product.id
                                                            )
                                                        );
                                                        setSelectedOrderProductsSKU((prev: number[]) =>
                                                            prev.filter(
                                                                (selectedProduct: number) =>
                                                                    selectedProduct !== product.id
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
                                        <TableRow
                                            sx={{
                                                "&:last-child td, &:last-child th": { border: 0 },
                                            }}
                                        >
                                            <TableCell
                                                colSpan={3}
                                                align="right"
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Total
                                            </TableCell>
                                            <TableCell
                                                colSpan={1}
                                                align="center"
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                {currencyFormatter(generateOrderTotalAmount())}
                                            </TableCell>
                                        </TableRow>
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

export default EditDraft;
