"use client"

import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { checkIfSameDayAsToday, currencyFormatter, formatDate } from "@/utils/services/utils";
import { USER_ROLES } from "@/types/constants";
import { getSaleById } from "@/utils/serverActions/Sale";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: "4px 4px",
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

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { id } = use(params);
  const { data: session } = useSession()
  const currentUser = session?.user
  const posOrders = (window as any)?.pos?.orders
  const [orderData, setOrderData] = useState<any>({});
  const [openRejectionModal, setOpenRejectionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openConfirmApproveModal, setOpenConfirmApproveModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [rejectionReason, setRejectionReason] = useState("");
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchOrderData = async () => {
    setLoading(true);
    setOrderData({});
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
      setOrderData(orderResponse?.data || {});
      // setOrderData({ id: res[0].id, ...res[0].data(), orderItems: list });
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
    fetchOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenConfirmApproveModal = () => {
    setOpenConfirmApproveModal(true);
    handleClose();
  };

  const hanldeCloseConfirmApproveModal = () => {
    setOpenConfirmApproveModal(false);
  };

  return (
    <>
      <LoadingAlert open={loading} />

      {/* <ConfirmationModal
        open={openConfirmApproveModal}
        onClose={hanldeCloseConfirmApproveModal}
        onConfirm={handleApproveOrder}
        message="Are you sure you want to approve this order?"
        title="Approve Order"
      /> */}
      <Box mb={10}>
        <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
          <Link
            href={"/sales"}
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <ArrowUpwardIcon />
              Sales
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={1}
          // mt={1}
          // px={{ xs: 1, sm: 2, md: 3 }}
          >
            <Typography variant="body1" fontWeight={700} gutterBottom>
              Customer Details
            </Typography>
            <Box display="flex" gap={1}>
              {((checkIfSameDayAsToday(orderData?.createdAt) &&
                currentUser?.role === USER_ROLES.SALES_PERSONEL) || currentUser?.role === USER_ROLES.ADMIN) && (
                  <Button
                    variant="contained"
                    disableElevation
                    component={Link}
                    href={`/sales/${id}/edit`}
                    size="small"
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                )}

            </Box>
          </Box>
          {Object.keys(orderData).length !== 0 && (
            <>
              <Card sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {/* <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4
                    }}

                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Sales #:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.id}
                    </Typography>
                  </Grid> */}

                  {/* Customer name */}
                  {/* <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4
                    }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Name:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.customer_name?.toUpperCase()}
                    </Typography>
                  </Grid> */}

                  {/* phone number */}
                  {/* <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}

                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Phone number:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {orderData?.customer_phoneNumber}
                    </Typography>
                  </Grid> */}


                  {/* Amount Paid */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Total Amount:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.total_amount || 0)}
                    </Typography>
                  </Grid>
                  {/* Profit Paid */}
                  {currentUser?.role === USER_ROLES.ADMIN && (
                    < Grid
                      size={{ xs: 12, sm: 6, md: 4 }}
                      sx={{
                        display: "flex",
                        gap: "5px",
                      }}
                    >
                      <Typography variant="body1">Profit:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {currencyFormatter(orderData?.profit || 0)}
                      </Typography>
                    </Grid>
                  )}

                  <Grid

                    size={{ xs: 12, sm: 12, md: 6 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Date ordered:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {formatDate(orderData?.createdAt)}
                    </Typography>
                  </Grid>
                  {/* Date updated */}
                  <Grid

                    size={{ xs: 12, sm: 12, md: 6 }}
                    sx={{ display: "flex", gap: "10px" }}
                  >
                    <Typography variant="body1">Last updated:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {formatDate(orderData?.updatedAt)}
                    </Typography>
                  </Grid>

                </Grid>
              </Card>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                mt={2}
                mb={2}
                alignItems={"flex-end"}
              >
                <Typography variant="body1" fontWeight={700}>
                  Sales Products
                </Typography>
              </Box>
              <Paper
                sx={{ width: { md: "50%", xs: "100%" }, overflow: "hidden" }}
              >
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table aria-label="results table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Product</StyledTableCell>

                        <StyledTableCell align="center">Qty</StyledTableCell>
                        <StyledTableCell align="center">
                          Unit Price
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Total Price
                        </StyledTableCell>
                        {/* <StyledTableCell align="center"></StyledTableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderData?.salesItems?.length !== 0 &&
                        orderData?.salesItems?.map(
                          (product: any, index: number) => (
                            <StyledTableRow key={product?._id}>
                              <StyledTableCell>
                                {product?.product?.name?.toUpperCase()}
                              </StyledTableCell>

                              <StyledTableCell align="center">
                                <InputBase
                                  type="number"
                                  value={product?.qty}
                                  // value={getStudentScoreAndGrade(student, "score")}
                                  disabled={
                                    true
                                    //   editResult.show &&
                                    //   editResult?.product?.name !== product?.name
                                  }
                                  // onChange={(e: any) => {
                                  //   const value = e.target.value;
                                  //   handleSubmitScore(
                                  //     value,
                                  //     product?.docId,
                                  //     index,
                                  //     "core"
                                  //   );
                                  // }}
                                  inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    maxLength: 3,
                                    style: { textAlign: "center" },
                                  }}
                                  // placeholder="Enter score"
                                  style={{
                                    width: "50px",
                                    // paddingLeft: "10px",
                                    border: "none",
                                    // editResult.show &&
                                    // editResult?.product?.name === product?.name
                                    //   ? "1px solid #00205B"
                                    //   : "none",
                                    transition: "all 0.7s ease",
                                  }}
                                />
                              </StyledTableCell>

                              <StyledTableCell align="center">
                                {currencyFormatter(product?.product_price || 0)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {currencyFormatter(product?.total_amount || 0)}
                              </StyledTableCell>
                              {/* <StyledTableCell>
                                {editResult.show &&
                              editResult?.product?.name === product?.name ? (
                                <>
                                  <Tooltip title="save score">
                                    <IconButton
                                      disabled={
                                        product?.score === "" ||
                                        product?.score === null
                                      }
                                      onClick={() => handleSaveOne(product)}
                                    >
                                      <SaveIcon sx={{ fontSize: "16px" }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="cancel">
                                    <IconButton
                                      onClick={() =>
                                        setEditResult({
                                          show: false,
                                          product: null,
                                        })
                                      }
                                    >
                                      <ClearIcon sx={{ fontSize: "16px" }} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="edit score">
                                  <IconButton
                                    onClick={() =>
                                      setEditResult({
                                        show: true,
                                        product: product,
                                      })
                                    }
                                  >
                                    <EditIcon sx={{ fontSize: "16px" }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              </StyledTableCell> */}
                            </StyledTableRow>
                          )
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>
      </Box >
    </>
  );
}
