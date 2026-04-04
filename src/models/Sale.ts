import mongoose, { Model, Types } from "mongoose";
import Counter from "./Counter"; // Import Counter model

export type ISale = mongoose.Document & {
  _id: string;
  salesNumber: number; // Added salesNumber field
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
    salesNumber: { type: Number, unique: true }, // Added salesNumber to schema
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

// Pre-save hook to auto-generate unique sequential salesNumber
saleSchema.pre("save", async function (next) {
  const doc = this as any;
  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "salesNumber" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.salesNumber = counter.seq;
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", saleSchema);

export default Sale;

