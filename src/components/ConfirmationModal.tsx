import React from "react";
import { Box, Typography, Button, Dialog } from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  title: string;
  confirmButtonText?:string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  message,
  title,
  confirmButtonText
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography variant="h6" id="delete-modal-title">
          {title}
        </Typography>
        <Typography
          variant="body1"
          id="delete-modal-description"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} color="primary" variant="contained">
            {confirmButtonText ? confirmButtonText : "Yes"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConfirmationModal;
