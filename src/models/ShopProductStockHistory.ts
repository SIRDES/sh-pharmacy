import mongoose, { Model, Types } from "mongoose";

export type IShopProductStockHistory = mongoose.Document & {
  _id: string;
  productId: Types.ObjectId;
  shopId: Types.ObjectId;
  shopProductId: Types.ObjectId;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};

const shopProductStockHistorySchema = new mongoose.Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    shopId: { type: Types.ObjectId, ref: "Shop", required: true },
    shopProductId: { type: Types.ObjectId, ref: "ShopProduct", required: true },
    initialQuantity: { type: Number, required: true },
    addedQuantity: { type: Number, required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
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

// shopProductStockHistorySchema.post(
//   "save",
//   function (error: any, doc: any, next: any) {
//     if (
//       error.name === "MongoServerError" &&
//       error.code === 11000 &&
//       error.keyPattern &&
//       error.keyPattern.shopProductId
//     ) {
//       next(new Error("Shop product stock history already exists for this shop and product"));
//     } else {
//       next(error);
//     }
//   }
// );

const ShopProductStockHistory: Model<IShopProductStockHistory> =
  mongoose.models.ShopProductStockHistory ||
  mongoose.model<IShopProductStockHistory>(
    "ShopProductStockHistory",
    shopProductStockHistorySchema
  );

export default ShopProductStockHistory;
