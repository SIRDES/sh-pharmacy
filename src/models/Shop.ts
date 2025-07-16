import mongoose, { Model, Types } from "mongoose";

export type IShop = mongoose.Document & {
  _id: string;
  name?: string;
  isDeleted: boolean;
  isSuspended: boolean;
};


const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
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

const Shop: Model<IShop> =
  mongoose.models.Shop || mongoose.model<IShop>("Shop", shopSchema);

export default Shop;
