import mongoose, { Model, Types } from "mongoose";

export type IProduct = mongoose.Document & {
  _id: string;
  name: string;
  sku: number;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  expiryDate: Date;
  isDeleted: boolean;
  isSuspended: boolean;
};


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    sku: { type: Number, required: true, unique: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
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

productSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000 && error.keyPattern && error.keyPattern.name) {
    next(new Error("Product name already exist"));
  } else {
    next(error);
  }
});


const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
