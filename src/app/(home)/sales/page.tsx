"use client"
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { CustomizedSelect } from "@/components/CustomizedSelect";
import Link from "next/link";
import { currencyFormatter, formatDate } from "@/utils/services/utils";
import { getAllSales, getAllShopSales } from "@/utils/serverActions/Sale";
import { useShopsContext } from "@/context/ShopsContext";

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
  "&:hover": {
    cursor: "pointer",
  },
}));

export default function Orders() {
  // const theme = useTheme();
  const router = useRouter();
  const {
    selectedShop,
  } = useShopsContext();
  const { data: session } = useSession()
  const currentUser = session?.user;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);

  const [fetchedOrders, setFetchedOrders] = useState<any>(null);
  const [orders, setOrders] = useState<Array<any>>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchOrderData = async () => {
    setLoading(true);
    setFetchedOrders([]);
    setOrders([]);
    try {
      let orderResponse;
      if (currentUser?.role === "admin") {
        orderResponse = await getAllShopSales({ shopId: selectedShop?._id as string, startDate, endDate });
        // orderResponse = await getAllSales({ startDate, endDate });
      } else {
        orderResponse = await getAllShopSales({ shopId: currentUser?.assignedShop?._id, startDate, endDate });
      }

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
    if (selectedShop === null || selectedShop === undefined || currentUser === null || currentUser === undefined) {
      return
    }
    fetchOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShop]);

  const handleClick = (order: any) => {
    router.push(`/sales/${order._id}`);
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <Box>
        <Box px={{ xs: 1, sm: 2, md: 3 }} pt={2} mb={1}>
          <form>
            <Grid container spacing={2} alignItems={"flex-end"}>
              <Grid size={{ xs: 12, sm: 4, }}>
                <Typography variant="body1" gutterBottom>
                  Start Date
                </Typography>
                <TextField fullWidth type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} inputProps={{
                  style: {
                    padding: 5
                  }
                }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, }}>
                <Typography variant="body1" gutterBottom>
                  End Date
                </Typography>
                <TextField fullWidth type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} inputProps={{
                  style: {
                    padding: 5
                  }
                }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, }}>
                <Button type="submit" disableElevation disabled={startDate === "" || endDate === ""} onClick={(e) => {
                  e.preventDefault()
                  fetchOrderData()
                }} size="small" variant="contained">Submit</Button>
              </Grid>
            </Grid>
          </form>


        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Box display={"flex"} gap={3}>

          </Box>
          {currentUser?.role !== "admin" && (
            <Button
              component={Link}
              href={'/sales/add-sales'}
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: "4px",
                // background: "#5812B3",
                width: "fit-content",
                color: "white",
                fontWeight: 700,
              }}
            >
              New Sales
            </Button>
          )}


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
                  {/* <StyledTableCell>
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
                  </StyledTableCell> */}
                  {/* <StyledTableCell>Name</StyledTableCell> */}
                  <StyledTableCell>
                    Total Amount{" "}
                    {/* <Tooltip title={`Sort amount`}>
                      <ArrowUpwardIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "12px",
                          marginLeft: "5px",
                        }}
                        onClick={handleSortAmount}
                      />
                    </Tooltip> */}
                  </StyledTableCell>
                  {/* <StyledTableCell>Contact</StyledTableCell>
                  <StyledTableCell>Address</StyledTableCell> */}
                  <StyledTableCell>Date</StyledTableCell>
                  {/* <StyledTableCell>Status</StyledTableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders &&
                  !!orders.length &&
                  orders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order: any, index: number) => (
                      <StyledTableRow
                        key={index}
                        onClick={() => handleClick(order)}
                        sx={{ cursor: "pointer" }}
                      >
                        {/* <StyledTableCell>
                          {order?.id}
                        </StyledTableCell> */}
                        {/* <StyledTableCell>
                          {`${order?.customer_name}`.toUpperCase()}
                        </StyledTableCell> */}
                        <StyledTableCell>
                          {currencyFormatter(order?.total_amount || 0)}
                        </StyledTableCell>

                        {/* <StyledTableCell>
                          {order?.customer_phoneNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.customer_address}
                        </StyledTableCell> */}
                        <StyledTableCell>
                          {formatDate(order?.createdAt)}
                        </StyledTableCell>
                        {/* <StyledTableCell>
                          {order?.status}
                        </StyledTableCell> */}
                      </StyledTableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </>
  );
}
