import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    Divider,
    InputAdornment,
    MenuItem,
    Paper,

    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,

    IconButton,
    Menu,
} from "@mui/material";
import { useEffect, useState } from "react";

import Tooltip from "@mui/material/Tooltip";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import LoadingAlert from "../LoadingAlert";
import ConfirmationModal from "../ConfirmationModal";
import { useRouter } from "next/navigation";
import { showAlert } from "../Alerts";
import { ORDER_STATUS } from "@/types/constants";
import { currencyFormatter } from "@/utils/services/utils";
import { getAllProductStockHistories } from "@/utils/serverActions/ProductStockHistory";
import { useSession } from "next-auth/react";
import { deleteDraftSale, getAllShopDraftSales } from "@/utils/serverActions/Sale";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: "9px 8px",
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 14,
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
}));

export default function AllDrafts({ handleEditDraft }: any) {
    // const theme = useTheme();
    const navigate = useRouter();
    const { data: session } = useSession()
    const currentUser = session?.user;
    // const posOrders = (window as any)?.pos?.orders
    // const posOrderItems = (window as any)?.pos?.orderItems
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [openConfirmModal, setOpenConfirmModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const [sortAsc, setSortAsc] = useState(false);
    const [sortAmountAsc, setSortAmountAsc] = useState(false);
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)

    const [fetchedOrders, setFetchedOrders] = useState<any>(null);
    const [orders, setOrders] = useState<Array<any>>([]);

    const handleMenuClick = (
        event: React.MouseEvent<HTMLElement>,
        item: any
    ) => {
        setSelectedDraftId(item._id)
        setAnchorEl(event.currentTarget);

    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const fetchOrderData = async () => {
        setLoading(true);
        setFetchedOrders([]);
        setOrders([]);
        try {
            let orderResponse;
            orderResponse = await getAllShopDraftSales({ shopId: currentUser?.assignedShop?._id });

            // console.log("orderResponse", orderResponse)
            if (!orderResponse.success) {
                showAlert({
                    title: "Error",
                    text: orderResponse?.message || "An error occurred while fetching orders",
                    severity: "error",
                })
                return
            }

            if (orderResponse?.data?.length === 0) {
                showAlert({
                    title: "No Sales",
                    severity: "warning",
                    text: "No sales found for the selected date range.",
                })
                return;
            }

            setFetchedOrders(orderResponse?.data || []);
            setOrders(orderResponse?.data || []);
        } catch (error: any) {
            // console.log("error", error);
            showAlert({
                title: "Error",
                text: error?.message || "An error occurred while fetching orders",
                severity: "error",
            })
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (currentUser === null || currentUser === undefined) {
            return
        }
        fetchOrderData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const handleSortByIDAsc = () => {
        const sortedOrders = orders.sort((a: any, b: any) => {
            const orderA = a.id
            const orderB = b.id
            if (sortAsc) {
                if (orderA > orderB) return -1;
                else if (orderA < orderB) return 1;
                return 0;
            } else {
                if (orderA < orderB) return -1;
                else if (orderA > orderB) return 1;
                return 0;
            }
        });
        setOrders(sortedOrders);
        setSortAsc((prev) => !prev);
    };
    const handleSortAmount = () => {
        const sortedOrders = orders.sort((a: any, b: any) => {
            const orderA = a.totalAmount;
            const orderB = b.totalAmount;
            if (sortAmountAsc) {
                if (orderA > orderB) return -1;
                else if (orderA < orderB) return 1;
                return 0;
            } else {
                if (orderA < orderB) return -1;
                else if (orderA > orderB) return 1;
                return 0;
            }
        });
        setOrders(sortedOrders);
        setSortAmountAsc((prev) => !prev);
    };
    const hanldeCloseConfirmModal = () => {
        setSelectedDraftId(null)
        setOpenConfirmModal(false)
    }


    const handleDeleteOrder = async () => {

        setLoading(true);

        try {
            const res = await deleteDraftSale(selectedDraftId as string)
            if (!res?.success) {
                showAlert({
                    title: "Error",
                    text: res?.message ||
                        "An error occurred",
                    severity: "error"
                })
                return
            }


            showAlert({
                title: "Success",
                text: "Sale deleted successfully",
                severity: "success"
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
            hanldeCloseConfirmModal();
        }
    };
    const handleSearchByCustomerNameOrOrderNumber = (e: any) => {
        const value = e.target.value;
        const filteredOrders = fetchedOrders.filter(
            (order: any) =>
                order?.customer_name?.toUpperCase().includes(value.toLowerCase()) ||
                order?.id?.toString().includes(value)
        );
        setOrders(filteredOrders);
    };

    return (
        <>
            <LoadingAlert open={loading} />
            <ConfirmationModal
                open={openConfirmModal}
                onClose={hanldeCloseConfirmModal}
                onConfirm={handleDeleteOrder}
                message={`Are you sure you want to delete this sale from draft?`}
                title={"Delete Sale from draft"}
            />
            <Box
                display={"flex"}
                justifyContent={"space-between"}
                mb={2}
                mt={2}
                px={{ xs: 1, sm: 2, md: 3 }}
            >
                <Box display={"flex"} gap={3}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by Order Number or Customer Name"
                        onChange={handleSearchByCustomerNameOrOrderNumber}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

            </Box>
            <Divider />
            <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
                <TableContainer component={Paper}>
                    <Table
                        stickyHeader
                        sx={{ minWidth: 650 }}
                        aria-label="students table"
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>
                                    ID{" "}
                                    <Tooltip
                                        title={`Sort in ${sortAsc ? "descending" : "ascending"}`}
                                    >
                                        <ArrowUpwardIcon
                                            sx={{
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                marginLeft: "5px",
                                                transition: "all 0.3s ease",
                                                transform: sortAsc
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                            }}
                                            onClick={handleSortByIDAsc}
                                        />
                                    </Tooltip>
                                </StyledTableCell>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>
                                    Total Amount{" "}
                                </StyledTableCell>
                                <StyledTableCell>Contact</StyledTableCell>
                                <StyledTableCell>Address</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell></StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders &&
                                !!orders.length &&
                                orders
                                    .map((order: any, index: number) => (
                                        <StyledTableRow
                                            key={index}

                                        >
                                            <StyledTableCell>
                                                {order?.id}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {`${order?.customer_name}`.toUpperCase()}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {currencyFormatter(order?.total_amount || 0)}
                                            </StyledTableCell>

                                            <StyledTableCell>
                                                {order?.customer_phoneNumber}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {order?.customer_address}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {order?.createdAt}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {order?.status}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Box>
                                                    <IconButton
                                                        id="options-icon"
                                                        onClick={(event) =>
                                                            handleMenuClick(event, order)
                                                        }
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>

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
                                                        <MenuItem onClick={() => handleEditDraft(selectedDraftId)}>
                                                            Edit
                                                        </MenuItem>


                                                        <MenuItem
                                                            onClick={() => {
                                                                setOpenConfirmModal(true);
                                                                handleClose();
                                                            }}
                                                            sx={{ color: "red" }}
                                                        >
                                                            Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
}
