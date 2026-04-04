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
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import { useSession } from "next-auth/react";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import SaleRecieptPDF from "@/components/sales/SaleReciept";
import PrintIcon from "@mui/icons-material/Print";
import { useRef } from "react";
import { checkIfSameDayAsToday, currencyFormatter, formatDate } from "@/utils/services/utils";
import { USER_ROLES } from "@/types/constants";
import { deleteSale, getSaleById } from "@/utils/serverActions/Sale";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const router = useRouter();
  const { data: session } = useSession()
  const currentUser = session?.user
  const posOrders = (window as any)?.pos?.orders
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [rejectionReason, setRejectionReason] = useState("");
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

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

  const handleOpenConfirmDeleteModal = () => {
    setOpenConfirmDeleteModal(true);
  };

  const hanldeCloseConfirmDeleteModal = () => {
    setOpenConfirmDeleteModal(false);
  };

  const handleDeleteSale = async () => {
    hanldeCloseConfirmDeleteModal();
    setLoading(true);
    try {
      const response = await deleteSale(id as string);
      if (response.success) {
        showAlert({
          title: "Success",
          text: response.message || "Sale deleted successfully",
          severity: "success",
          handleConfirmButtonClick: () => {
            router.push("/sales");
          },
        });
      } else {
        showAlert({
          title: "Error",
          text: response.message || "An error occurred while deleting the sale",
          severity: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />

      <ConfirmationModal
        open={openConfirmDeleteModal}
        onClose={hanldeCloseConfirmDeleteModal}
        onConfirm={handleDeleteSale}
        message="Are you sure you want to delete this sale? This action will revert the product stock."
        title="Delete Sale"
      />
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
                  <Box display="flex" gap={1}>
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
                    <Button
                      variant="contained"
                      color="error"
                      disableElevation
                      onClick={handleOpenConfirmDeleteModal}
                      size="small"
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                )}

              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => handlePrint()}
              >
                Print
              </Button>

            </Box>
          </Box>
          {Object.keys(orderData).length !== 0 && (
            <>
              <Card sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {/* Amount Paid */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Sub Total:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.sub_total || 0)}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    sx={{
                      display: "flex",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1">Discount:</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currencyFormatter(orderData?.discount || 0)}
                    </Typography>
                  </Grid>
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
                    <Typography variant="body1">Date created:</Typography>
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
                        {currentUser?.role === USER_ROLES.ADMIN && (
                          <StyledTableCell align="center">
                            Profit
                          </StyledTableCell>
                        )}
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
                                {currencyFormatter(product?.product?.sellingPrice || 0)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {currencyFormatter(product?.total_amount || 0)}
                              </StyledTableCell>

                              {currentUser?.role === USER_ROLES.ADMIN && (
                                <StyledTableCell align="center">
                                  {currencyFormatter(product?.profit || 0)}
                                </StyledTableCell>
                              )}

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

      {/* Hidden Receipt for Printing */}
      <Box sx={{ display: "none" }}>
        {Object.keys(orderData).length !== 0 && (
          <div ref={componentRef}>
            <SaleRecieptPDF orderData={orderData} />
          </div>
        )}
      </Box>
    </>
  );
}
