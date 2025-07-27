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

export default function ManageShopsStockModal({
  open,
  setOpen,
  onClose,
  handleConfirmation,
  students,
  setSelectedProducts,
  setStockValue,
  setStockOperation,
  stockValue,
  stockOperation,
  selectedShopId,
  selectedShopProduct,
  setSelectedShopId
}: {
  open: boolean;
  onClose: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  students: any[];
  setSelectedProducts: Dispatch<React.SetStateAction<any[]>>;
  handleConfirmation: () => void;
  setStockValue: React.Dispatch<React.SetStateAction<number | string>>;
  setStockOperation: React.Dispatch<React.SetStateAction<"ADD" | "SUBTRACT">>;
  stockValue: number | string;
  stockOperation: "ADD" | "SUBTRACT";
  selectedShopId: string | null,
  selectedShopProduct: any;
  setSelectedShopId: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const theme = useTheme();
  const { shops } = useShops()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [fetchedStudents, setFetchedStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudentsIds, setSelectedStudentsIds] = useState<string[]>([]);
  useEffect(() => {
    setFetchedStudents(students);
    setFilteredStudents(students);
  }, [students]);
  // const handleModalClose = () => {
  //   setOpen(false);
  // };
  const handleModalClose = () => {
    onClose();
    setSelectedStudentsIds([]);
  };

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        `${student?.name}`
          .toLowerCase()
          .includes(value.toLowerCase())
    );
    setFilteredStudents(filteredStudents);
  };
  useMemo(() => {
    let selectedStudents: any[] = [];
    for (const student of students) {
      if (selectedStudentsIds.includes(student._id)) {
        selectedStudents.push(student);
      }
    }
    // console.log(selectedStudents);
    // console.log(selectedStudents.length);
    setSelectedProducts(selectedStudents);
  }, [selectedStudentsIds]);

  const handleFetchShopProducts = async () => {
    try {
      if (!selectedShopId) return
      const shopProducts = await getAllShopProducts({ shopId: selectedShopId });
      console.log("shopProducts", shopProducts)
      // setShopProducts(shopProducts?.data?.[0] || null)
      // setSelectedShopProduct(shopProducts?.data?.[0] || null)
    } catch (error) {
      console.log(error)
    }
  }
  const handleSendResultsClick = () => {
    handleConfirmation();
    handleModalClose()
  };
  return (
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

                    <StyledTableCell>Current Qty</StyledTableCell>
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
                          {student?.name?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.currentStock}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <TextField
                            size="small"
                            // fullWidth
                            variant="outlined"
                            type={"number"}
                            placeholder="0"
                            value={stockValue === 0 ? "" : stockValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              // setValue(value);
                              setStockValue(value);
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
              onClick={handleSendResultsClick}
              disabled={selectedStudentsIds.length === 0}
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
  );
}
