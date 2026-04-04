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

export const getAllProductStockHistories = async ({ page = 1, limit = 10 }: { page?: number, limit?: number }) => {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const result = await ProductStockHistory.aggregate([
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: "$product" },
          ],
        },
      },
    ]);

    const histories = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(histories)),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
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

export const getAllProductStockHistoriesByProductId = async ({
  productId,
  page = 1,
  // limit = 10
}: {
  productId: string;
  page?: number;
  // limit?: number;
}) => {
  try {
    await connectDB();
    const skip = (page - 1) * 50;

    const result = await ProductStockHistory.aggregate([
      {
        $match: { productId: new mongoose.Types.ObjectId(productId) },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: 50 },
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
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
          ],
        },
      },
    ]);

    const histories = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / 50);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(histories)),
      total: totalCount,
      page: page,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit: 50,
      },
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

    if (!productId || !operation) {
      return { success: false, message: "All fields are required" };
    }
    if (initialQuantity === undefined || initialQuantity === null) {
      return { success: false, message: "Initial quantity is required" };
    }
    if (addedQuantity === undefined || addedQuantity === null) {
      return { success: false, message: "Added quantity is required" };
    }
    if (userId === undefined || userId === null) {
      return { success: false, message: "User ID is required" };
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

// not in use
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

// not in use
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
