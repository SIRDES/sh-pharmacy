"use server";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import ProductStockHistory from "@/models/ProductStockHistory";

// get the currently logged in user from the session in server side

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

export const getAllProductStockHistories = async () => {
  try {
    await connectDB();
    // const currentUser = await getCurrentUser();
    const ProductStockHistories = await ProductStockHistory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!ProductStockHistories || ProductStockHistories.length === 0) {
      return {
        success: false,
        message: "No product stock history found",
        data: [],
      };
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(ProductStockHistories)),
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err?.message || "An error occurred",
      data: [],
    };
  }
};

export const getAllProductStockHistoriesByProductId = async (
  productId: string
) => {
  try {
    await connectDB();

    const histories = await ProductStockHistory.aggregate([
      {
        $match: { productId: new mongoose.Types.ObjectId(productId) },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(histories)),
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const addAProductStockHistory = async (data: {
  productId: string;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: string;
}) => {
  try {
    await connectDB();
    const { productId, initialQuantity, addedQuantity, operation, userId } = data;

    if (!productId || !initialQuantity || !addedQuantity || !operation) {
      return { success: false, message: "All fields are required" };
    }

    await ProductStockHistory.insertOne({
      productId,
      initialQuantity,
      addedQuantity,
      operation,
      userId,
    });

    return {
      success: true,
      message: "Product stock history added successfully",
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const addMultipleProductStockHistories = async (
  data: {
    productId: string;
    initialQuantity: number;
    addedQuantity: number;
    operation: "add" | "subtract";
    userId: string;
  }[]
) => {
  try {
    await connectDB();

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: "No product stock histories to add" };
    }

    const insertOperations = data.map((item) => ({
      productId: item.productId,
      initialQuantity: item.initialQuantity,
      addedQuantity: item.addedQuantity,
      operation: item.operation,
      userId: item.userId,
    }));

    await ProductStockHistory.insertMany(insertOperations);

    return {
      success: true,
      message: `${data.length} product stock histories added successfully`,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateAProductStockHistory = async (
  id: string,
  data: {
    initialQuantity?: number;
    addedQuantity?: number;
    operation?: "add" | "subtract";
  }
) => {
  try {
    await connectDB();

    const updatedHistory = await ProductStockHistory.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updatedHistory) {
      return { success: false, message: "Product stock history not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedHistory)),
      message: "Product stock history updated successfully",
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const deleteAProductStockHistory = async (id: string) => {
  try {
    await connectDB();

    const deletedHistory = await ProductStockHistory.findByIdAndDelete(id);

    if (!deletedHistory) {
      return { success: false, message: "Product stock history not found" };
    }

    return {
      success: true,
      message: "Product stock history deleted successfully",
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
