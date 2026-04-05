import mongoose, { Model, Types } from "mongoose";
import Counter from "./Counter";

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
    name: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    sku: { type: Number, unique: true, index: true },
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


// Pre-save hook to auto-generate unique sequential sku
productSchema.pre("save", async function (next) {
  const doc = this as any;
  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "productSKU" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.sku = counter.seq;
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});


const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
