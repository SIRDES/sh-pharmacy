import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, TextField, MenuItem, Select, Grid } from "@mui/material";
import { CustomizedSelect } from "../CustomizedSelect";

interface ManageStockModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stockValue: number | string;
  stockOperation: "ADD" | "SUBTRACT";
  setStockValue: React.Dispatch<React.SetStateAction<number | string>>;
  setStockOperation: React.Dispatch<React.SetStateAction<"ADD" | "SUBTRACT">>;
}

const ManageStockModal: React.FC<ManageStockModalProps> = ({
  open,
  onClose,
  onConfirm,
  setStockValue,
  setStockOperation,
  stockValue,
  stockOperation
}) => {
  // const [operation, setOperation] = useState<"ADD" | "SUBTRACT">("ADD");
  // const [value, setValue] = useState<number | string>(0);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="add-modal-title"
      aria-describedby="add-modal-description"
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          pt: 2,
          minWidth: 400,
          // minWidth: "100%",
        }}
      >
        <Typography variant="h6" mb={2} id="delete-modal-title">
          Manage stock
        </Typography>

        <Typography variant="body1" mb={1} id="delete-modal-title">
          Enter quantity to add/substract from product stock
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Select
              fullWidth
              displayEmpty
              input={<CustomizedSelect />}
              value={stockOperation}
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
          <Grid size={{ xs: 6 }}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              type={"number"}
              placeholder="enter quantity"
              value={stockValue === 0 ? "" : stockValue}
              onChange={(e) => {
                const value = e.target.value;
                // setValue(value);
                setStockValue(value);
              }}
              inputProps={{
                style: {
                  border: "2px solid #ABB3BF",
                  padding: "9px",
                  // paddingTop: "17px",
                  borderRadius: "5px",
                },
              }}
            />
          </Grid>

        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              // setValue(0);
              // setOperation("ADD");
            }}
            disabled={stockValue === 0 || stockValue === ""}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ManageStockModal;
