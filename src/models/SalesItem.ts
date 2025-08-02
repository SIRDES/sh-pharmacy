import mongoose, { Model, Types } from "mongoose";

export type ISalesItem = mongoose.Document & {
  _id: string;
  saleId: Types.ObjectId;
  productId: Types.ObjectId;
  qty: number;
  total_amount: number;
  profit: number;
  shopProductId: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};


const salesItemSchema = new mongoose.Schema(
  {
    saleId: {
      type: Types.ObjectId,
      ref: "Sale",
      required: true,
      index: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    shopProductId: {
      type: Types.ObjectId,
      ref: "ShopProduct",
      required: true,
      index: true,
    },
    total_amount: { type: Number, required: true },
    profit: { type: Number, required: true },
    qty: { type: Number, required: true },
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

const SalesItem: Model<ISalesItem> =
  mongoose.models.SalesItem || mongoose.model<ISalesItem>("SalesItem", salesItemSchema);

export default SalesItem;
