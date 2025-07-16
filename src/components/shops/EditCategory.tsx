import React, { SyntheticEvent, useEffect, useState } from "react";
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
import { updateShop } from "@/utils/serverActions/Shop";

interface EditCategoryModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchFunction?: () => void;
  categoryData: any;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  open,
  setOpen,
  refetchFunction,
  categoryData,
}) => {

  const [value, setValue] = useState<string>(categoryData?.name || "");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setValue(categoryData?.name);
  }, [categoryData]);
  const handleValueChange = (e: any) => {
    setValue(e.target.value);
  };

  const onClose = () => {
    setOpen(false);
    // setValue("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(value);
    setLoading(true);
    try {
      const res = await updateShop({ shopId: categoryData._id, shopData: { name: value?.trim()?.toUpperCase() } })
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred",
          severity: "error",
        });
        return;
      }

      if (refetchFunction) {
        refetchFunction();
      }
      showAlert({
        title: "Success",
        text: "Shop updated successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.log(error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
      onClose();
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
          <Typography variant="body1" fontWeight={600}>
            Edit Shop
          </Typography>
          <IconButton onClick={onClose} sx={{ padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Box
          sx={{
            p: 2,
            width: "100%",
          }}
        >
          <Typography variant="body1" id="delete-modal-title">
            Shop name
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={25} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCategoryModal;
