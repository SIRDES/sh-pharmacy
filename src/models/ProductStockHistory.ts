import mongoose, { Model, Types } from "mongoose";

export type IProductStockHistory = mongoose.Document & {
  _id: string;
  productId: Types.ObjectId;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  isDeleted: boolean;
  isSuspended: boolean;
};

// CREATE TABLE IF NOT EXISTS product_stock_updates (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     productId INTEGER NOT NULL REFERENCES products(id),
//     initial_quantity INTEGER NOT NULL,
//     added_quantity INTEGER NOT NULL,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME
//   )
const productStockHistorySchema = new mongoose.Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    initialQuantity: { type: Number, required: true },
    addedQuantity: { type: Number, required: true },
    operation: { type: String, enum: ["add", "subtract"], required: true },
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
