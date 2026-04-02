"use server";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import ProductStockHistory from "@/models/ProductStockHistory";
import ShopProductStockHistory from "@/models/ShopProductStockHistory";

// get the currently logged in user from the session in server side

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

export const getAllShopProductStockHistoryByProductId = async (
  productId: string
) => {
  try {
    await connectDB();
    // const currentUser = await getCurrentUser();
    const ProductStockHistories = await ShopProductStockHistory.aggregate([
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
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "shops",
          localField: "shopId",
          foreignField: "_id",
          as: "shop",
        },
      },
      {
        $unwind: "$shop",
      },
      {
        $lookup: {
          from: "shopproducts",
          localField: "shopProductId",
          foreignField: "_id",
          as: "shopProduct",
        },
      },
      {
        $unwind: "$shopProduct",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
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

export const getAllShopProductStockHistoriesByShopIdAndProductId = async (
  shopId: string,
  productId: string
) => {
  try {
    await connectDB();

    const histories = await ShopProductStockHistory.aggregate([
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          productId: new mongoose.Types.ObjectId(productId),
        },
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
        $lookup: {
          from: "shops",
          localField: "shopId",
          foreignField: "_id",
          as: "shop",
        },
      },
      { $unwind: "$shop" },
      {
        $lookup: {
          from: "shopproducts",
          localField: "shopProductId",
          foreignField: "_id",
          as: "shopProduct",
        },
      },
      { $unwind: "$shopProduct" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
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

export const addShopProductStockHistory = async (data: {
  shopId: string;
  productId: string;
  shopProductId: string;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: string;
}) => {
  try {
    await connectDB();
    const { shopId, productId, shopProductId, initialQuantity, addedQuantity, operation, userId } = data;
    console.log("data", data)

    if (!shopId || !productId || !shopProductId || !operation || !userId) {
      return { success: false, message: "All fields are required" };
    }
    if (initialQuantity === undefined || initialQuantity === null) {
      return { success: false, message: "Initial quantity is required" };
    }
    if (addedQuantity === undefined || addedQuantity === null) {
      return { success: false, message: "Added quantity is required" };
    }

    await ShopProductStockHistory.insertOne({
      shopId,
      productId,
      shopProductId,
      initialQuantity,
      addedQuantity,
      operation,
      userId,
    });

    return {
      success: true,
      message: "Shop product stock history added successfully",
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const addMultipleShopProductStockHistories = async (data: {
  shopId: string;
  productId: string;
  shopProductId: string;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: string;
}[]) => {
  try {
    await connectDB();
    // const { shopId, productId, shopProductId, initialQuantity, addedQuantity, operation, userId } = data;
    // console.log("data", data)

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: "No product stock histories to add" };
    }

    const insertOperations = data.map((item) => ({
      shopId: item.shopId,
      productId: item.productId,
      shopProductId: item.shopProductId,
      initialQuantity: item.initialQuantity,
      addedQuantity: item.addedQuantity,
      operation: item.operation,
      userId: item.userId,
    }));
    await ShopProductStockHistory.insertMany(insertOperations);

    return {
      success: true,
      message: "Shop product stock histories added successfully",
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

