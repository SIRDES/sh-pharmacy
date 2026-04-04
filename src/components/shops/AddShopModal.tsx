import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  IconButton,
  DialogActions,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { showAlert } from "../Alerts";
import { AddShop } from "@/utils/serverActions/Shop";

interface AddShopModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchFunction?: () => void;
}

const AddShopModal: React.FC<AddShopModalProps> = ({
  open,
  setOpen,
  refetchFunction,
}) => {
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // const posCategories = (window as any).pos?.categories
  const handleValueChange = (e: any) => {
    setValue(e.target.value);
  };

  const onClose = () => {
    setOpen(false);
    setValue("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // console.log(value);
    try {
      const res = await AddShop({ name: value?.trim()?.toUpperCase() })
      if (!res.success) {
        // onClose();
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred",
          severity: "error",
        });

        return
      }

      if (refetchFunction) {
        refetchFunction();
      }
      // onClose();
      showAlert({
        title: "Success",
        text: "Shop added successfully",
        severity: "success",
      });

    } catch (error: any) {
      console.log(error);
      // onClose();
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });

    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        maxWidth="sm"
        fullWidth
        component={"form"}
        onSubmit={handleSubmit}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 2,
            //   paddingX: 1,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Add new shop
          </Typography>
          <IconButton onClick={onClose} sx={{ padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Box
          sx={{
            //   bgcolor: "background.paper",
            //   boxShadow: 24,
            p: 2,
            //   px: 3,
            //   maxWidth: 400,
            width: "100%",
            //   textAlign: "center",
          }}
        >
          <Typography variant="body1" id="delete-modal-title">
            Enter shop name
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={value}
            variant="outlined"
            placeholder="enter shop name"
            sx={{ mt: 2 }}
            onChange={handleValueChange}
            required
          />
        </Box>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading || value === ""}
          >
            {loading ? <CircularProgress size={25} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddShopModal;
