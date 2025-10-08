import Button from "@mui/material/Button";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import {
  Backdrop,
  Box,
  Checkbox,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { StyledTableCell, StyledTableRow } from "@/theme/table";
import { CustomizedSelect } from "./CustomizedSelect";
import { useShops } from "@/hooks/useShops";
import { getAllShopProducts } from "@/utils/serverActions/ShopProduct";
import LoadingAlert from "./LoadingAlert";

export default function ManageShopsStockModal({
  open,
  onClose,
  handleConfirmation,
  setSelectedShopProducts,
  selectedShopProducts,
}: {
  open: boolean;
  onClose: () => void;
  selectedShopProducts: any[];
  setSelectedShopProducts: Dispatch<React.SetStateAction<any[]>>;
  handleConfirmation: () => void;
}) {
  const theme = useTheme();
  const { shops } = useShops()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [fetchedStudents, setFetchedStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  // const [selectedStudentsIds, setSelectedStudentsIds] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [stockOperation, setStockOperation] = useState<"ADD" | "SUBTRACT">("ADD");
  const [stockValues, setStockValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const handleModalClose = () => {
    onClose();
    // setSelectedStudentsIds([]);
    setStockOperation("ADD");
    setFetchedStudents([]);
    setFilteredStudents([]);
    setSelectedShopProducts([]);
    setStockValues([]);
    setSelectedShopId(null);
    setSearchValue("");
  };

  const handleSearch = (e: any) => {
    const value = e.target.value;
    setSearchValue(value);
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        `${student?.product?.name}`
          .toLowerCase()
          .includes(value.toLowerCase())
    );
    setFilteredStudents(filteredStudents);
  };

  const handleFetchShopProducts = async (shopId: string) => {
    try {
      setFetchedStudents([]);
      setFilteredStudents([]);
      setLoading(true);
      // if (!selectedShopId) return
      const shopProducts = await getAllShopProducts({ shopId: shopId });
      // console.log("shopProducts", shopProducts)
      if (shopProducts.success) {
        const lists = shopProducts?.data
        setFetchedStudents(lists);
        setFilteredStudents(lists);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }


  const handleChange = (e: any, product: any) => {
    const value = +e.target.value;
    const productId = product._id;
    const producttoUpdate = fetchedStudents.find((student: any) => student._id === productId);
    if (!producttoUpdate) return;
    const currentStock = producttoUpdate?.quantity;
    const productCurrentStock = producttoUpdate?.product?.currentStock;

    if (currentStock < value && stockOperation === "SUBTRACT") {
      // showAlert({
      //   title: "Error",
      //   text: "Quantity to be subtracted is more than the available stock",
      //   severity: "error",
      // })
      return
    }
    if (productCurrentStock < value && stockOperation === "ADD") {
      // showAlert({
      //   title: "Error",
      //   text: "Quantity to be subtracted is more than the available stock",
      //   severity: "error",
      // })
      return
    }
    let newStockValue = 0;
    let newProductStockValue = 0;
    if (stockOperation === "ADD") {
      newStockValue = currentStock + value;
      newProductStockValue = productCurrentStock - value

    } else if (stockOperation === "SUBTRACT") {
      newStockValue = currentStock - value;
      newProductStockValue = productCurrentStock + value
    }
    setSelectedShopProducts(prevProducts => {
      const index = prevProducts.findIndex((item: any) => item._id === product._id);
      if (index > -1) {
        // Already exists, update
        const updated = [...prevProducts];
        // updated[index] = { ...updated[index], product.quantity: newStockValue };
        updated[index] = { ...updated[index], quantity: newStockValue, product: { ...updated[index].product, currentStock: newProductStockValue } };
        return updated;
      } else {
        // Not in list yet
        return [...prevProducts, { ...product, quantity: newStockValue, product: { ...product.product, currentStock: newProductStockValue } }];
      }
    });
    setStockValues(prevProducts => {
      const index = prevProducts?.findIndex((item: any) => item._id === product._id);
      if (index > -1) {
        // Already exists, update
        const updated = [...prevProducts];
        updated[index] = { ...updated[index], value: value };
        return updated;
      } else {
        // Not in list yet
        return [...prevProducts, { _id: product._id, value: value }];
      }
    });
    const updatedStudents = filteredStudents?.map((student: any) => {
      if (student._id === product._id) {
        return { ...student, quantity: newStockValue, product: { ...student.product, currentStock: newProductStockValue } };
      }
      return student;
    });
    setFilteredStudents(updatedStudents);
  };
  const handleSave = () => {
    handleConfirmation();
    handleModalClose()
  };
  return (
    <>
      <LoadingAlert open={loading} />
      <Backdrop
        aria-labelledby="select-students-dialog"
        open={open}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Box
          component={Paper}
          sx={{ minHeight: "25vh", width: isMobile ? "90vw" : "65vw" }}
        >
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ px: isMobile ? 1 : 2 }}
          >
            {/* <Box /> */}
            <Typography variant="body1" fontWeight={700}>
              Manage shops stock
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleModalClose}
              sx={{
                // position: "absolute",
                // right: 8,
                // top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box>
            <Box sx={{ width: "100%", p: isMobile ? 1 : 2 }}>

              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    name={"search"}
                    fullWidth
                    size="small"
                    placeholder="Search product"
                    value={searchValue}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Select
                    fullWidth
                    displayEmpty
                    input={<CustomizedSelect />}
                    renderValue={() => {
                      if (selectedShopId === null || selectedShopId === "") {
                        return (
                          <em style={{ color: "#ABB3BF" }}>Select shop</em>
                        );
                      } else {
                        return <em>{shops?.find((shop: any) => shop._id === selectedShopId)?.name?.toUpperCase()}</em>;
                      }
                    }}
                    value={selectedShopId || ""}
                    onChange={(e) => {
                      setSelectedShopId(e.target.value)
                      handleFetchShopProducts(e.target.value)
                    }}

                  >
                    {shops && shops?.map((shop: any) => (
                      <MenuItem key={shop._id} value={shop._id}>
                        {shop?.name?.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Select
                    fullWidth
                    displayEmpty
                    input={<CustomizedSelect />}
                    value={stockOperation || "ADD"}
                    onChange={(e) => {
                      const operationValue = e.target.value as "ADD" | "SUBTRACT";
                      // setOperation(operationValue);
                      setStockOperation(operationValue);
                    }}
                  >
                    <MenuItem value={"ADD"}>ADD</MenuItem>
                    <MenuItem value={"SUBTRACT"}>SUBTRACT</MenuItem>
                  </Select>
                </Grid>
              </Grid>

              <TableContainer component={Paper} sx={{ height: "350px" }}>
                <Table
                  stickyHeader
                  sx={{ minWidth: 550 }}
                  aria-label="students table"
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Name</StyledTableCell>

                      <StyledTableCell>Product Qty</StyledTableCell>
                      <StyledTableCell>Shop Qty</StyledTableCell>
                      <StyledTableCell align="center">Qty</StyledTableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents?.length > 0 &&
                      filteredStudents?.map((student: any, index: number) => (
                        <StyledTableRow
                          key={student?._id}

                        // sx={{ cursor: "pointer" }}
                        >

                          <StyledTableCell>
                            {student?.product?.name?.toUpperCase()}
                          </StyledTableCell>
                          <StyledTableCell>
                            {student?.product?.currentStock}
                          </StyledTableCell>
                          <StyledTableCell>
                            {student?.quantity}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <TextField
                              size="small"
                              // fullWidth
                              variant="outlined"
                              type={"number"}
                              placeholder="0"
                              value={stockValues?.find((item: any) => item._id === student._id)?.value || ""}
                              onChange={(e) => {
                                handleChange(e, student);
                              }}
                              inputProps={{
                                style: {
                                  border: "1px solid #ABB3BF",
                                  padding: "2px",
                                  textAlign: "center",
                                  // paddingTop: "17px",
                                  // borderRadius: "5px",
                                  width: "40px",
                                },
                              }}
                            />
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Divider />
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              sx={{ width: "100%", p: isMobile ? 1 : 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleModalClose}
                sx={{
                  width: "fit-content",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={selectedShopProducts.length === 0}
                sx={{
                  width: "fit-content",
                }}
              >
                save
              </Button>
            </Box>
          </Box>
        </Box>
      </Backdrop>
    </>
  );
}
