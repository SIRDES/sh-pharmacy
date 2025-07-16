import mongoose, { Model, Types } from "mongoose";

export type IAdminSetting = mongoose.Document & {
  _id: string;
  contact?: string[];
  email?: string;
  endOfSMS?: string;
  startOfSMS?: string;
  isDeleted: boolean;
  isSuspended: boolean;
};


const adminSettingSchema = new mongoose.Schema(
  {
    contact: { type: [String], default: [] },
    email: { type: String, default: "" },
    endOfSMS: { type: String, default: "" },
    startOfSMS: { type: String, default: "" },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AdminSetting: Model<IAdminSetting> =
  mongoose.models.AdminSetting ||
  mongoose.model<IAdminSetting>("AdminSetting", adminSettingSchema);

export default AdminSetting;
