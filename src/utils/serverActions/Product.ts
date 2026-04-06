"use server";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { addAProductStockHistory, addMultipleProductStockHistories } from "./ProductStockHistory";
import ShopProduct from "@/models/ShopProduct";
import Counter from "@/models/Counter";

// get the cuurently logined user from the session in server side

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

export const getAllProducts = async ({
  page = 1,
  limit = 50,
  search = "",
  filter = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: "expiringSoon" | "expired" | "all";
} = {}) => {
  try {
    await connectDB();

    const skip = (page - 1) * limit;
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const matchStage: any = { isDeleted: { $ne: true } };

    if (search) {
      matchStage.name = { $regex: search, $options: "i" };
    }

    if (filter === "expired") {
      matchStage.expiryDate = { $lt: now };
    } else if (filter === "expiringSoon") {
      matchStage.expiryDate = { $gte: now, $lte: threeMonthsFromNow };
    }

    const result = await Product.aggregate([
      { $match: matchStage },
      {
        $facet: {
          data: [
            {
              $lookup: {
                from: "shopproducts",
                localField: "_id",
                foreignField: "productId",
                as: "shopProducts",
              },
            },
            { $sort: { name: 1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const products = result[0].data || [];
    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    if (!products || products.length === 0) {
      return {
        success: true,
        message: "No product found",
        data: [],
        metadata: { totalCount, totalPages, currentPage: page },
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      metadata: { totalCount, totalPages, currentPage: page },
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

export const addProduct = async (
  data: {
    name: string;
    costPrice: number;
    sellingPrice: number;
    currentStock: number;
    expiryDate: Date;
  }[]
) => {
  try {
    await connectDB();

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: "No products to add" };
    }
    const currentUser = await getCurrentUser();


    // Get the latest SKU to continue numbering
    const lastProduct = await Counter.findOne({ id: "productSKU" })
    let nextSku = lastProduct?.seq ? lastProduct.seq + 1 : 1;

    const productsToInsert = [];
    const stockHistoriesToInsert: {
      productId: string;
      initialQuantity: number;
      addedQuantity: number;
      operation: "add";
      userId: string;
    }[] = [];

    for (const item of data) {
      const { name, costPrice, sellingPrice, currentStock, expiryDate } = item;

      if (!name || !costPrice || !sellingPrice || !expiryDate) {
        return {
          success: false,
          message: "All fields are required for each product",
        };
      }

      if (sellingPrice < costPrice) {
        return {
          success: false,
          message: `Selling price must be greater than or equal to cost price for product ${name}`,
        };
      }

      productsToInsert.push({
        name: name.toLowerCase().trim(),
        costPrice,
        sellingPrice,
        currentStock,
        sku: nextSku++,
        expiryDate,
      });
    }

    const addedProducts = await Product.insertMany(productsToInsert);

    if (!addedProducts || addedProducts.length === 0) {
      return { success: false, message: "No products added" };
    }

    await Counter.updateOne(
      { id: "productSKU" },
      { $set: { seq: nextSku - 1 } },
      { upsert: true }
    )

    for (const product of addedProducts) {
      stockHistoriesToInsert.push({
        productId: product._id as string,
        initialQuantity: 0,
        addedQuantity: product.currentStock,
        operation: "add",
        userId: currentUser?._id as string,
      })
    }

    await addMultipleProductStockHistories(stockHistoriesToInsert)

    return {
      success: true,
      message: `${productsToInsert.length} product(s) added successfully`,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// get product by id
export const getProuctById = async (id: string) => {
  try {
    await connectDB();
    const product = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "shopproducts",
          localField: "_id",
          foreignField: "productId",
          as: "shopProducts",
        },
      },
      {
        $unwind: {
          path: "$shopProducts",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: "shopProducts.shopId",
          foreignField: "_id",
          as: "shopProducts.shopDetails",
        },
      },
      {
        $unwind: {
          path: "$shopProducts.shopDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          costPrice: { $first: "$costPrice" },
          sellingPrice: { $first: "$sellingPrice" },
          currentStock: { $first: "$currentStock" },
          sku: { $first: "$sku" },
          expiryDate: { $first: "$expiryDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          shopProducts: {
            $push: {
              $cond: [
                { $ifNull: ["$shopProducts._id", false] },
                {
                  _id: "$shopProducts._id",
                  productId: "$shopProducts.productId",
                  shopId: "$shopProducts.shopId",
                  quantity: "$shopProducts.quantity",
                  shopDetails: "$shopProducts.shopDetails",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $addFields: {
          shopProducts: {
            $cond: [
              { $eq: [{ $size: "$shopProducts" }, 0] },
              [],
              "$shopProducts",
            ],
          },
        },
      },
    ]);
    const productResult = product[0] || null;
    if (!productResult) {
      return { success: false, message: "Product not found" };
    }

    return {
      success: true,
      data: {
        ...JSON.parse(JSON.stringify(productResult)),
        // stockHistories: JSON.parse(JSON.stringify(productHistories.data)),
      },
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// update product
export const updateProduct = async ({
  productId,
  productData,
}: {
  productId: string;
  productData: any;
}) => {
  try {
    await connectDB();
    // Find the user by ID and update their details
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...productData,
      },
      { new: true } // Return the updated document
    );
    // console.log("updatedProduct", updatedProduct)
    if (!updatedProduct) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedProduct)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// update a products stock
export const updateProductsStock = async (product: {
  productId: string;
  currentStock: number;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: string;
}) => {
  try {
    await connectDB();
    //  prepare stock update operations
    // const updateOperations = products.map((product) => ({
    //   updateOne: {
    //     filter: { _id: product.productId },
    //     update: { $set: { currentStock: product.currentStock } },
    //   },
    // }));

    const updatedProducts = await Product.findByIdAndUpdate(product.productId, { currentStock: product.currentStock });
    await addAProductStockHistory(product)
    return { success: true, data: JSON.parse(JSON.stringify(updatedProducts)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const updateMultipleProductsStock = async (products: {
  productId: string;
  currentStock: number;
  initialQuantity: number;
  addedQuantity: number;
  operation: "add" | "subtract";
  userId: string;
}[]) => {
  try {
    await connectDB();
    //  prepare stock update operations
    const updateOperations = products.map((product) => ({
      updateOne: {
        filter: { _id: product.productId },
        update: { $set: { currentStock: product.currentStock } },
      },
    }));

    const updatedProducts = await Product.bulkWrite(updateOperations);
    await addMultipleProductStockHistories(products)
    return { success: true, data: JSON.parse(JSON.stringify(updatedProducts)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// delete a product
export const deletedProduct = async (productId: string) => {
  try {
    await connectDB();

    // find all shopProducts that has this productId and delete them as well

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return { success: false, message: "Product not found" };
    }
    // delete all shopProducts that has this productId
    const deletedShopProducts = await ShopProduct.deleteMany({ productId });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(deletedProduct)),
      message: "Product deleted successfully",
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
