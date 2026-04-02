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
      index: true,
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

shopProductSchema.index({ shopId: 1, productId: 1 }, { unique: true, name: "shopProductId" });

shopProductSchema.post(
  "save",
  function (error: any, doc: any, next: any) {
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.shopProductId
    ) {
      next(new Error("Shop product already exists for this shop and product"));
    } else {
      next(error);
    }
  }
);

const ShopProduct: Model<IShopProduct> =
  mongoose.models.ShopProduct || mongoose.model<IShopProduct>("ShopProduct", shopProductSchema);

export default ShopProduct;
