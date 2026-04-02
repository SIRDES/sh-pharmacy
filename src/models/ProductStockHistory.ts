import mongoose, { Model, Types } from "mongoose";

export type IProductStockHistory = mongoose.Document & {
  _id: string;
  productId: Types.ObjectId;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};

const productStockHistorySchema = new mongoose.Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    initialQuantity: { type: Number, required: true },
    addedQuantity: { type: Number, required: true },
    operation: { type: String, enum: ["add", "subtract"], required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
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

const ProductStockHistory: Model<IProductStockHistory> =
  mongoose.models.ProductStockHistory ||
  mongoose.model<IProductStockHistory>(
    "ProductStockHistory",
    productStockHistorySchema
  );

export default ProductStockHistory;
