"use client";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { getAllUsers } from "@/utils/serverActions/user";

export default function Users() {
  const theme = useTheme();
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);

  const [sortAsc, setSortAsc] = useState(false);
  const [fetchedOrders, setFetchedOrders] = useState<any>(null);
  const [orders, setOrders] = useState<Array<any>>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchUsersData = async () => {
    setLoading(true);
    setFetchedOrders([]);
    setOrders([]);

    try {
      const res = await getAllUsers();
      console.log("res", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while fetching users",
          severity: "error",
        })
        return;
      }
      setFetchedOrders(res?.data);
      setOrders(res?.data);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred while fetching users",
        severity: "error",
      })
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleSearchByUserName = (e: any) => {
    const value = e.target.value;
    if (value === "") return setOrders(fetchedOrders);
    const filteredOrders = fetchedOrders.filter(
      (order: any) =>
        order?.name?.toLowerCase().includes(value.toLowerCase()) || order?.username?.toLowerCase().includes(value.toLowerCase()) ||
        order?.id?.toString()?.includes(value)
    );
    setOrders(filteredOrders);
  };
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
              placeholder="Search user"
              onChange={handleSearchByUserName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

          </Box>
          <Box display={"flex"} gap={3}>
            <Box>
              <Button
                component={Link}
                href={"/users/add-new-user"}
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
                New User
              </Button>
            </Box>
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
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Username</StyledTableCell>
                  <StyledTableCell>Phone Number</StyledTableCell>
                  <StyledTableCell>Gender</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell>Status </StyledTableCell>
                  {/* <StyledTableCell></StyledTableCell> */}
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
                        onClick={() =>
                          router.push(`/users/${order?._id}`)
                          // navigate(`${URLS.USER_DETAILS(order?.id)}`)
                        }
                        sx={{ cursor: "pointer" }}
                      >
                        {/* <StyledTableCell>{order?.id}</StyledTableCell> */}
                        <StyledTableCell>
                          {`${order?.name}`.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.username}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.phoneNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.gender}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${order?.role}`.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {order?.isSuspended ? "INACTIVE" : "ACTIVE"}
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
        </Box>
      </Box>
    </>
  );
}
