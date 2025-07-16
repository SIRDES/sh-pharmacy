"use client";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  ListItem,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { USER_ROLES } from "@/types/constants";
import Link from "next/link";
import { currencyFormatter } from "@/utils/services/utils";
import { getAllProducts } from "@/utils/serverActions/Product";
import dayjs from "dayjs";

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
  // "&:hover": {
  //   cursor: "pointer",
  // },
}));

// Initialize Firestore

export default function Products() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;
  console.log("currentUser", currentUser)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);

  const [sortAsc, setSortAsc] = useState(false);
  const [sortAmountAsc, setSortAmountAsc] = useState(false);

  const [fetchedOrders, setFetchedOrders] = useState<any>(null);
  const [orders, setOrders] = useState<Array<any>>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchProductsData = async () => {
    setLoading(true);
    setFetchedOrders([]);
    setOrders([]);
    try {
      const res = await getAllProducts();
      // console.log("res", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while fetching products",
          severity: "error",
        })
        return
      }
      console.log("all products", res?.data)
      setFetchedOrders(res?.data);
      setOrders(res?.data);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while fetching products",
        severity: "error",
      })

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleSearchByProductNameOrOrderNumber = (e: any) => {
    const value = e.target.value;
    const filteredOrders = fetchedOrders.filter(
      (order: any) =>
        order?.name?.toUpperCase().includes(value.toUpperCase()) ||
        order?.sku?.toString().includes(value)
    );
    setOrders(filteredOrders);
  };
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN
  return (
    <>
      <LoadingAlert open={loading} />
      <Box>
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
              placeholder="Search product"
              onChange={handleSearchByProductNameOrOrderNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

          </Box>
          {currentUser?.role === USER_ROLES.ADMIN && (
            <Box>
              <Button
                component={Link}
                href={"/products/add-product"}
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
                Product
              </Button>
              {/* <Menu
                id="menu-batch"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <ListItem
                  component={Link}
                  href={"/products/add-product"}
                  sx={{ color: "text.primary" }}
                >
                  Single
                </ListItem>
                <ListItem
                // sx={{ fontSize: "12px" }}
                // onClick={handleExcelClick}
                >
                  From excel
                </ListItem>
              </Menu> */}
            </Box>
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

                  <StyledTableCell>
                    SKU{" "}
                    {/* <Tooltip
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
                    </Tooltip> */}
                  </StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  {isAdmin && <StyledTableCell>Cost price</StyledTableCell>}
                  <StyledTableCell>Selling price</StyledTableCell>
                  {!isAdmin && <StyledTableCell>Qty</StyledTableCell>}
                  {isAdmin && <StyledTableCell>Current Qty</StyledTableCell>}
                  {isAdmin && <StyledTableCell>Qty In shops</StyledTableCell>}
                  <StyledTableCell>Expiry Date</StyledTableCell>
                  <StyledTableCell>Exp. Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders &&
                  !!orders?.length &&
                  orders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order: any, index: number) => (
                      <StyledTableRow
                        key={index}
                        onClick={() =>
                          isAdmin &&
                          router.push(`/products/${order?._id}`)
                        }
                        sx={{ cursor: isAdmin ? "pointer" : "default" }}
                      >

                        <StyledTableCell align="center">
                          {order?.sku}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${order?.name}`?.toUpperCase()}
                        </StyledTableCell>
                        {isAdmin && <StyledTableCell>
                          {currencyFormatter(order?.costPrice || 0)}
                        </StyledTableCell>}


                        <StyledTableCell>
                          {currencyFormatter(order?.sellingPrice || 0)}
                        </StyledTableCell>



                        {!isAdmin && <StyledTableCell>
                          {order?.shopProducts?.length > 0 ? order?.shopProducts?.find((shopProduct: any) => shopProduct?.shopId === currentUser?.assignedShop?._id)?.quantity || 0 : 0}
                        </StyledTableCell>}

                        {isAdmin && <StyledTableCell align="center">
                          {order?.currentStock}
                        </StyledTableCell>}

                        {isAdmin && <StyledTableCell align="center">
                          {order?.shopProducts?.length > 0 ? order?.shopProducts?.map((shopProduct: any) => shopProduct?.quantity).reduce((a: number, b: number) => a + b, 0) : 0}
                        </StyledTableCell>}
                        <StyledTableCell>
                          {order?.expiryDate ? dayjs(order.expiryDate).format("ddd DD MMM YYYY") : ""}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.expiryDate
                            ? (() => {
                              const today = dayjs();
                              const expiry = dayjs(order.expiryDate);
                              if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
                                return "Expired";
                              } else if (expiry.isBefore(today.add(3, "month"), "day")) {
                                return "Expiring soon";
                              } else {
                                return "Not yet";
                              }
                            })()
                            : ""}
                        </StyledTableCell>

                      </StyledTableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={orders?.length || 0}
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
