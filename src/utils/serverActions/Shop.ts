"use server";

import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import User from "@/models/User";
import mongoose from "mongoose";

export const getAllShops = async () => {
    try {
        await connectDB();
        const shops = await Shop.find().sort({ createdAt: 1 });

        if (!shops || shops.length === 0) {
            return { success: false, message: "No shop found", data: [] };
        }
        return { success: true, data: JSON.parse(JSON.stringify(shops)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred", data: [] }
    }
};


export const AddShop = async (data: {
    name: string;
}) => {
    try {
        await connectDB();
        // console.log("data", data);
        const { name } = data;

        const result = await Shop.create({
            name
        });
        return { success: true, message: "Shop added successfullu" };;
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


export const getAShopById = async (id: string) => {
    try {
        await connectDB();

        const shop = await Shop.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "assignedShop",
                    as: "users"
                }
            },
            {
                $lookup: {
                    from: "shopproducts",
                    localField: "_id",
                    foreignField: "shopId",
                    as: "shopProducts"
                }
            },
            {
                $unwind: {
                    path: "$shopProducts",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "shopProducts.productId",
                    foreignField: "_id",
                    as: "shopProducts.product"
                }
            },
            {
                $unwind: {
                    path: "$shopProducts.product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    createdAt: { $first: "$createdAt" },
                    users: { $first: "$users" },
                    shopProducts: {
                        $push: {
                            $cond: [
                                { $ifNull: ["$shopProducts._id", false] },
                                {
                                    _id: "$shopProducts._id",
                                    shopId: "$shopProducts.shopId",
                                    productId: "$shopProducts.productId",
                                    quantity: "$shopProducts.quantity",
                                    product: "$shopProducts.product"
                                },
                                "$$REMOVE"
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    shopProducts: {
                        $ifNull: ["$shopProducts", []]
                    }
                }
            }
        ]);
        const shopData = shop[0];
        if (!shop) {
            return { success: false, message: "Shop not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(shopData)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


// update shop
export const updateShop = async ({ shopId, shopData }: { shopId: string, shopData: any }) => {
    try {
        await connectDB();
        // Find the shop by ID and update their details
        const updatedShop = await Shop.findByIdAndUpdate(
            shopId,
            {
                ...shopData,
            },
            { new: true } // Return the updated document
        );
        if (!updatedShop) {
            return { success: false, message: "Shop not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(updatedShop)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
}

// delete a shop
export const deleteShop = async (shopId: string) => {
    try {
        await connectDB();
        const deletedShop = await Shop.findByIdAndDelete(shopId);
        if (!deletedShop) {
            return { success: false, message: "Shop not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(deletedShop)), message: "Shop deleted successfully" };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
}