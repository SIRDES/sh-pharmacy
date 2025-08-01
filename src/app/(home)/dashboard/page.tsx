"use client";
import React, { act, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Menu,
  MenuItem,
  Divider,
  Button,
  TextField,
  TableContainer,
  Table,
  Paper,
  TableHead,
  TableRow,
  TableBody,
  TablePagination,
} from "@mui/material";

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, format } from 'date-fns';
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { currencyFormatter, formatDate, getTotalOrderAmount, getTotalOrderDiscount, getTotalOrderProfit } from "@/utils/services/utils";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { useSession } from "next-auth/react";
import { getAllSales, getAllShopSales } from "@/utils/serverActions/Sale";
import { useShopsContext } from "@/context/ShopsContext";

export default function Dashboard() {
  const { data: session } = useSession()
  const currentUser = session?.user;
  const {
    selectedShop,
  } = useShopsContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any>([]);
  const [thisWeekOrders, setthisWeekOrders] = useState<any>([]);
  const [thisMonthOrders, setThisMonthOrders] = useState<any>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // console.log("selectedShop", selectedShop)
  // console.log("this weeks start date", startOfWeek(new Date(), { weekStartsOn: 1 }));
  // console.log("this weeks end date", endOfWeek(new Date(), { weekStartsOn: 1 }));
  // console.log("this months start date", startOfMonth(new Date()));
  // console.log("this months end date", endOfMonth(new Date()));
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
    setOrders([]);
    try {
      let orderResponse;

      if (currentUser?.role === "admin") {
        orderResponse = await getAllShopSales({ shopId: selectedShop?._id as string, startDate, endDate });
        // orderResponse = await getAllSales({ shopId: currentUser?.assignedShop?._id as string, startDate, endDate });
      } else {
        orderResponse = await getAllShopSales({ shopId: currentUser?.assignedShop?._id, startDate, endDate });
      }
      console.log("orderResponse", orderResponse);
      if (!orderResponse.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: orderResponse?.message || "An error occurred!",
        });
        return
      }
      setOrders(orderResponse?.data || []);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser === null || currentUser === undefined || currentUser === undefined || currentUser === null) {
      return
    }
    fetchOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedShop]);

  const fetchThisWeekOrderData = async () => {
    setthisWeekOrders([]);
    try {
      let orderResponse
      if (currentUser?.role === "admin") {
        orderResponse = await getAllShopSales({ shopId: selectedShop?._id as string, startDate: startOfWeek(new Date(), { weekStartsOn: 1 })?.toString(), endDate: endOfWeek(new Date(), { weekStartsOn: 1 })?.toString() });
        // orderResponse = await getAllSales({ startDate: startOfWeek(new Date(), { weekStartsOn: 1 })?.toString(), endDate: endOfWeek(new Date(), { weekStartsOn: 1 })?.toString() });
      } else {
        orderResponse = await getAllShopSales({ shopId: currentUser?.assignedShop?._id, startDate: startOfWeek(new Date(), { weekStartsOn: 1 })?.toString(), endDate: endOfWeek(new Date(), { weekStartsOn: 1 })?.toString() });
      }
      console.log("orderResponse", orderResponse);
      if (!orderResponse.success) {
        return
      }

      setthisWeekOrders(orderResponse?.data || []);
    } catch (error: any) {

    }
  };
  const fetchThisMonthOrderData = async () => {
    setThisMonthOrders([]);
    try {
      let orderResponse;

      if (currentUser?.role === "admin") {
        orderResponse = await getAllShopSales({ shopId: selectedShop?._id as string, startDate: startOfMonth(new Date())?.toString(), endDate: endOfMonth(new Date())?.toString() });
        // orderResponse = await getAllSales({ startDate: startOfMonth(new Date())?.toString(), endDate: endOfMonth(new Date())?.toString() });
      } else {
        orderResponse = await getAllShopSales({ shopId: currentUser?.assignedShop?._id, startDate: startOfMonth(new Date())?.toString(), endDate: endOfMonth(new Date())?.toString() });
      }
      console.log("orderResponse", orderResponse);
      if (!orderResponse.success) {
        return
      }
      setThisMonthOrders(orderResponse?.data || []);
    } catch (error: any) {

    }
  };

  useEffect(() => {
    if (currentUser === null || currentUser === undefined || currentUser === undefined || currentUser === null) {
      return
    }
    fetchThisWeekOrderData();
    fetchThisMonthOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedShop]);

  return (
    <>
      <LoadingAlert open={loading} />
      <Box sx={{ flexGrow: 1, py: 2 }} px={{ xs: 1, sm: 2, md: 3 }}>
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

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={1} mb={3}>
          <Grid size={{ xs: 12, sm: 4, }}>
            <Card sx={{ bgcolor: "primary.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2">
                  Total Sales
                </Typography>
                <Typography variant="h6">{currencyFormatter(getTotalOrderAmount(orders))}</Typography>
                {currentUser?.role === "admin" && (
                  <>
                    <Typography variant="body2">
                      Discount
                    </Typography>
                    <Typography variant="h6">{currencyFormatter(getTotalOrderDiscount(orders))}</Typography>
                    <Typography variant="body2">
                      Profit
                    </Typography>
                    <Typography variant="h6">{currencyFormatter(getTotalOrderProfit(orders))}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, }}>
            <Card sx={{ bgcolor: "warning.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2">
                  Sales this Week
                </Typography>
                <Typography variant="h6">{currencyFormatter(getTotalOrderAmount(thisWeekOrders))}</Typography>
                {currentUser?.role === "admin" && (
                  <>
                    <Typography variant="body2">
                      Discount
                    </Typography>
                    <Typography variant="h6" >{currencyFormatter(getTotalOrderDiscount(thisWeekOrders))}</Typography>
                    <Typography variant="body2">
                      Profit
                    </Typography>
                    <Typography variant="h6" >{currencyFormatter(getTotalOrderProfit(thisWeekOrders))}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, }}>
            <Card sx={{ bgcolor: "info.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2">
                  Sales this Month
                </Typography>
                <Typography variant="h6">{currencyFormatter(getTotalOrderAmount(thisMonthOrders))}</Typography>
                {currentUser?.role === "admin" && (
                  <>
                    <Typography variant="body2">
                      Discount
                    </Typography>
                    <Typography variant="h6">{currencyFormatter(getTotalOrderDiscount(thisMonthOrders))}</Typography>
                    <Typography variant="body2">
                      Profit
                    </Typography>
                    <Typography variant="h6">{currencyFormatter(getTotalOrderProfit(thisMonthOrders))}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, }}>
            <Typography variant="body2" gutterBottom>
              Sales
            </Typography>
            <TableContainer component={Paper}>
              <Table
                stickyHeader
                sx={{ minWidth: 450 }}
                aria-label="students table"
              >
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Total Amount</StyledTableCell>
                    <StyledTableCell>Date/Time</StyledTableCell>
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
                        // onClick={() =>
                        //   navigate(`${URLS.USER_DETAILS(order?.id)}`)
                        // }
                        // sx={{ cursor: "pointer" }}
                        >
                          <StyledTableCell>
                            {currencyFormatter(order?.total_amount || 0)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatDate(order?.createdAt)}
                          </StyledTableCell>
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
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
