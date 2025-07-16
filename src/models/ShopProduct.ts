import mongoose, { Model, Types } from "mongoose";

export type IShopProduct = mongoose.Document & {
  _id: string;
  shopId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  isDeleted: boolean;
  isSuspended: boolean;
};


const shopProductSchema = new mongoose.Schema(
  {
    shopId: {
      type: Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
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
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);

const ShopProduct: Model<IShopProduct> =
  mongoose.models.ShopProduct || mongoose.model<IShopProduct>("ShopProduct", shopProductSchema);

export default ShopProduct;
