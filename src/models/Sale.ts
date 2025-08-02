import mongoose, { Model, Types } from "mongoose";

export type ISale = mongoose.Document & {
  _id: string;
  shopId: Types.ObjectId;
  total_amount: number;
  profit: number;
  sub_total?: number;
  discount?: number;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId[] | null;
  isDeleted: boolean;
  isSuspended: boolean;
};



const saleSchema = new mongoose.Schema(
  {
    total_amount: { type: Number, required: true },
    sub_total: { type: Number, required: true },
    discount: { type: Number, required: true },
    shopId: { type: Types.ObjectId, ref: "Shop", required: true, index: true },
    profit: { type: Number, required: true },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: [Types.ObjectId],
      ref: "User",
      default: [],
    },
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

const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", saleSchema);

export default Sale;
