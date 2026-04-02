"use server";

import { connectDB } from "@/lib/mongodb";
import ShopProduct from "@/models/ShopProduct";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";

// get the cuurently logined user from the session in server side

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

export const getAllShopProducts = async ({ shopId, productId }: { shopId?: string, productId?: string }) => {
  try {
    await connectDB();
    // Use aggregation to fetch shop products with populated shop and product details
    const matchStage: any = {};
    if (shopId) matchStage.shopId = new mongoose.Types.ObjectId(shopId);
    if (productId) matchStage.productId = new mongoose.Types.ObjectId(productId);

    if (!shopId && !productId) {
      return { success: false, message: "No product found", data: [] };
    }

    const products = await ShopProduct.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "shops",
          localField: "shopId",
          foreignField: "_id",
          as: "shop"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$shop" },
      { $unwind: "$product" },
      {
        $sort: {
          "product.name": 1, // A–Z
        },
      },
    ]);

    if (!products || products.length === 0) {
      return { success: true, message: "No product found", data: [] };
    }
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" }
  }
};




export const addShopProduct = async (data: {
  shopId: string;
  productId: string;
  quantity: number;
}) => {
  try {
    await connectDB();
    // console.log("data", data);
    const { shopId, productId, quantity } = data;

    if (!shopId || !productId || !quantity) {
      return { success: false, message: "All fields are required" };
    }

    const result = await ShopProduct.create({
      shopId,
      productId,
      quantity
    });
    // console.log("subjects", subjects);
    return { success: true, shopProductId: result._id, message: "Product quantity added successfullu" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


// update shop product
export const updateShopProduct = async ({ shopProductId, productData }: { shopProductId: string, productData: any }) => {
  try {
    await connectDB();
    const updatedProduct = await ShopProduct.findByIdAndUpdate(
      shopProductId,
      {
        ...productData,
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return { success: false, message: "Shop Product not found" };
    }
    return { success: true, shopProductId: updatedProduct._id, data: JSON.parse(JSON.stringify(updatedProduct)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}


export const updateMultipleShopProduct = async (shopProducts: any[]) => {
  try {
    await connectDB();
    //  prepare update operations
    const updateOperations = shopProducts.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: product }
      }
    }))

    const updatedProducts = await ShopProduct.bulkWrite(updateOperations);
    return { success: true, data: JSON.parse(JSON.stringify(updatedProducts)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}
// delete a product
export const deleteShopProduct = async (shopProductId: string) => {
  try {
    await connectDB();
    const deletedProduct = await ShopProduct.findByIdAndDelete(shopProductId);
    if (!deletedProduct) {
      return { success: false, message: "Shop Product not found" };
    }
    return { success: true, message: "Shop Product deleted successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}
