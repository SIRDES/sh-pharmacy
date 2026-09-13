"use client"

import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { showAlert } from "@/components/Alerts";
import { useRouter } from "next/navigation";
import LoadingAlert from "@/components/LoadingAlert";
import EditCategoryModal from "@/components/shops/EditCategory";
import Link from "next/link";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { currencyFormatter } from "@/utils/services/utils";
import { getAShopById } from "@/utils/serverActions/Shop";
import { useSession } from "next-auth/react";
import { exportShopProductsToPDF, exportShopProductsToXLSX } from "@/utils/services/exportProducts";
import { USER_ROLES } from "@/types/constants";
export default function CategoryDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const [categoryData, setCategoryData] = useState<any>({});
  const [fetchedCategoryData, setFetchedCategoryData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchShopData = async () => {
    if (!id) {
      showAlert({
        title: "Error",
        text: "Invalid shop id",
        severity: "error",
      })

      return
    };

    setLoading(true);
    setCategoryData({});
    try {
      const res = await getAShopById(id as string);
      // console.log("res", res);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred",
          severity: "error",
        });

        return;
      }
      // console.log(res?.data);
      setCategoryData(res?.data);

      setFetchedCategoryData(res?.data);

    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchByProductNameOrProductSKU = (e: any) => {
    const value = e.target.value;
    // console.log("value", value);
    // console.log("fetchedCategoryData", fetchedCategoryData);
    const filteredOrders = fetchedCategoryData?.shopProducts?.filter(
      (product: any) =>
        product?.product?.name?.toLowerCase()?.includes(value.toLowerCase()) ||
        product?.product?.sku?.toString()?.includes(value)
    );
    // console.log("filteredOrders", filteredOrders);
    setCategoryData({ ...categoryData, shopProducts: filteredOrders });
  };
  const handleSortByIDAsc = () => {
    setLoading(true);
    setSortAsc(!sortAsc);
    const sortedProducts = fetchedCategoryData?.shopProducts?.sort((a: any, b: any) => {
      if (!sortAsc) {
        return a?.quantity - b?.quantity;
      } else {
        return b?.quantity - a?.quantity;
      }
    });

    setTimeout(() => {
      setLoading(false);
      setCategoryData({ ...categoryData, shopProducts: sortedProducts });
    }, 300);
  };

  const handleExport = (format: "xlsx" | "pdf") => {
    handleClose();
    const productsToExport = categoryData?.shopProducts || [];

    if (!productsToExport.length) {
      showAlert({
        title: "No Products",
        text: "No products available to export for this shop",
        severity: "warning",
      });
      return;
    }

    try {
      if (format === "xlsx") {
        exportShopProductsToXLSX(
          productsToExport,
          categoryData?.name || "Shop",
          isAdmin
        );
      } else {
        exportShopProductsToPDF(
          productsToExport,
          categoryData?.name || "Shop",
          isAdmin
        );
      }

      showAlert({
        title: "Success",
        text: `Shop products exported as ${format.toUpperCase()} successfully`,
        severity: "success",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while exporting shop products",
        severity: "error",
      });
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />

      <EditCategoryModal
        open={openEditCategoryModal}
        setOpen={setOpenEditCategoryModal}
        refetchFunction={fetchShopData}
        categoryData={categoryData}
      />
      <Box mb={10}>
        <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
          <Link
            href={"/shops"}
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
              <ArrowBackIcon />
              Shops
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box
          mb={2}

        >
          <Box
            display={"flex"}
            gap={{ xs: 1, sm: 2, md: 3 }}
            justifyContent={"space-between"}
            alignItems={"center"}
            mb={1}
            mt={1}
            px={{ xs: 1, sm: 2, md: 3 }}
          >
            <Typography variant="body1" fontWeight={700} gutterBottom>
              Shop - {categoryData?.name?.toUpperCase()}
            </Typography>
            <Box display="flex">
              {categoryData && (
                <Tooltip title="Edit">
                  <IconButton onClick={() => setOpenEditCategoryModal(true)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}

            </Box>
          </Box>
          <Divider />
          {Object.keys(categoryData).length !== 0 && (
            <>
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
                    onChange={handleSearchByProductNameOrProductSKU}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={(event) =>
                      handleMenuClick(event)
                    }
                    size="small"
                  >
                    Action
                  </Button>

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
                    <MenuItem
                      onClick={() => handleExport("xlsx")}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <TableChartIcon fontSize="small" color="primary" />
                      Export as xlsx
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleExport("pdf")}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <PictureAsPdfIcon fontSize="small" color="error" />
                      Export as pdf
                    </MenuItem>

                  </Menu>
                </Box>
              </Box>
              <Divider />
              <Box mt={2} mb={4} px={{ xs: 1, sm: 2, md: 3 }}>
                <TableContainer component={Paper} sx={{
                  maxHeight: "calc(100vh - 250px)", // Adjust this value based on your layout
                  overflow: "auto",
                  // "& .MuiTable-stickyHeader": {
                  //   "& th": {
                  //     zIndex: 1,
                  //   },
                  // },
                }}>
                  <Table
                    stickyHeader
                    sx={{ minWidth: 650 }}
                    aria-label="shop products table"
                  >
                    <TableHead>
                      <TableRow>

                        <StyledTableCell>SKU </StyledTableCell>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>PRICE </StyledTableCell>
                        <StyledTableCell>Qty  <Tooltip
                          title={`${sortAsc ? "high to low" : "low to high"}`}
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
                        </Tooltip> </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryData?.shopProducts &&
                        categoryData?.shopProducts
                          // .slice(
                          //   page * rowsPerPage,
                          //   page * rowsPerPage + rowsPerPage
                          // )
                          .map((product: any, index: number) => (
                            <StyledTableRow
                              key={product?._id}
                            >
                              <StyledTableCell>
                                {product?.product?.sku}
                              </StyledTableCell>
                              <StyledTableCell>
                                {`${product?.product?.name}`.toUpperCase()}
                              </StyledTableCell>
                              <StyledTableCell>
                                {currencyFormatter(product?.product?.sellingPrice || 0)}
                              </StyledTableCell>
                              <StyledTableCell>
                                {product?.quantity || 0}
                              </StyledTableCell>

                            </StyledTableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={categoryData?.shopProducts?.length || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                /> */}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
