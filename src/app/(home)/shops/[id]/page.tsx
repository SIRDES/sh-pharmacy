"use client"

import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";

import DeleteIcon from "@mui/icons-material/Delete";
import { showAlert } from "@/components/Alerts";
import { useRouter } from "next/navigation";
import LoadingAlert from "@/components/LoadingAlert";
import EditCategoryModal from "@/components/shops/EditCategory";
import ConfirmationModal from "@/components/ConfirmationModal";
import Link from "next/link";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { currencyFormatter } from "@/utils/services/utils";
import { getAllShops, getAShopById } from "@/utils/serverActions/Shop";
import { signOut, useSession } from "next-auth/react";
export default function CategoryDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { id } = use(params);
  const router = useRouter();
  const posCategories = (window as any).pos?.categories
  const [categoryData, setCategoryData] = useState<any>({});
  const [fetchedCategoryData, setFetchedCategoryData] = useState<any>({});
  const [loading, setLoading] = useState(false);


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
  const [openDeleteConfirmationModal, setOpenDeleteConfirmationModal] = useState(false);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchShopData = async () => {
    setLoading(true);
    setCategoryData({});
    try {
      const res = await getAShopById(id as string);
      console.log("res", res);
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
  }, [id]);
  const handleOpenDeleteConfirmationModal = () => {
    setOpenDeleteConfirmationModal(true);
  };
  const handleCloseDeleteConfirmationModal = () => {
    setOpenDeleteConfirmationModal(false);
  };
  // const handleDeleteCategory = async () => {
  //   try {
  //     const res = await posCategories?.delete({ id: Number(id) });
  //     if (res?.status === "error") {
  //       showAlert({
  //         title: "Error",
  //         text: res?.message || "An error occurred",
  //         severity: "error",
  //       });
  //       return;
  //     }
  //     showAlert({
  //       title: "Success",
  //       text: res?.message || "Category deleted successfully",
  //       severity: "success",
  //       handleConfirmButtonClick: () => {
  //         router.back();
  //       }
  //     });

  //   } catch (error: any) {
  //     console.log("error", error);
  //     showAlert({
  //       title: "Error",
  //       text: error.message || error.data || "An error occurred",
  //       severity: "error",
  //     });
  //   } finally {
  //     setOpenDeleteConfirmationModal(false);
  //   }
  // };
  const handleSearchByProductNameOrProductSKU = (e: any) => {
    const value = e.target.value;
    console.log("value", value);
    const filteredOrders = fetchedCategoryData?.shopProducts?.filter(
      (order: any) =>
        order?.product?.name?.toLowerCase()?.includes(value.toLowerCase()) ||
        order?.product?.sku?.toString()?.includes(value)
    );
    console.log("filteredOrders", filteredOrders);
    setCategoryData({ ...categoryData, shopProducts: filteredOrders });
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
      {/* <ConfirmationModal
        open={openDeleteConfirmationModal}
        onClose={handleCloseDeleteConfirmationModal}
        onConfirm={handleDeleteCategory}
        title="Delete Shop"
        message="Are you sure you want to delete this shop?"
        confirmButtonText="Delete"
      /> */}
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
              <ArrowUpwardIcon />
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
            // flexDirection={{ xs: "column", md: "row" }}
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
                <Box>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => setOpenEditCategoryModal(true)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {/* <Tooltip title="Delete">
                    <IconButton onClick={handleOpenDeleteConfirmationModal}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip> */}
                </Box>

              )}
              {/* <>

                <Tooltip title="Add Product">
                  <IconButton onClick={handleMenuClick}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Menu
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
                    href={`/products/new?categoryId=${id}`}
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
                </Menu>
              </> */}
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
              </Box>
              <Divider />
              <Box mt={2} mb={4} px={{ xs: 1, sm: 2, md: 3 }}>
                <TableContainer component={Paper}>
                  <Table
                    stickyHeader
                    sx={{ minWidth: 650 }}
                    aria-label="students table"
                  >
                    <TableHead>
                      <TableRow>

                        <StyledTableCell>SKU </StyledTableCell>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>PRICE </StyledTableCell>
                        <StyledTableCell>Qty </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryData?.shopProducts &&
                        categoryData?.shopProducts
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
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
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={categoryData?.shopProducts?.length || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
