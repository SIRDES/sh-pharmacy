import { AlertColor } from "@mui/material";


export type BatchDetailsType = {
  form: "",
  amount: number,
  startDate: Date,
  endDate: Date
}
export type SnackbarType = {
  open: boolean;
  message: string;
  severity: AlertColor | undefined;
};



