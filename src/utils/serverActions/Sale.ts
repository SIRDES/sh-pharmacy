"use server";

import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import SalesItem from "@/models/SalesItem";
import ShopProduct from "@/models/ShopProduct";
import mongoose from "mongoose";
export const addNewSale = async (sale: { total_amount: number, profit: number, createdBy: string, shopId: string, discount: number, sub_total: number }) => {
    try {
        const { shopId, total_amount, profit, createdBy, discount, sub_total } = sale;
        await connectDB();
        const newSale = await Sale.create({
            shopId,
            total_amount,
            sub_total,
            discount,
            profit,
            createdBy,
            updatedBy: []
        });
        return { success: true, message: "Sale added successfully", data: JSON.parse(JSON.stringify(newSale)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


// get all sales
export const getAllSales = async (body?: { startDate?: string; endDate?: string }) => {
    try {
        const { startDate, endDate } = body || {};
        await connectDB();

        const filter: any = {
            isDeleted: false,
            isSuspended: false
        };
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        } else {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const sales = await Sale.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy"
                }
            },
            {
                $unwind: {
                    path: "$createdBy",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shopId"
                }
            },
            {
                $unwind: {
                    path: "$shopId",
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return { success: true, data: JSON.parse(JSON.stringify(sales)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


// get all sales
export const getAllShopSales = async (body?: { shopId: string; startDate?: string; endDate?: string }) => {
    try {
        const { startDate, endDate, shopId } = body || {};
        await connectDB();
        const shopIdObjectId = new mongoose.Types.ObjectId(shopId);
        const filter: any = {
            shopId: shopIdObjectId,
            isDeleted: false,
            isSuspended: false
        };
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        } else {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const sales = await Sale.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy"
                }
            },
            {
                $unwind: {
                    path: "$createdBy",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shopId"
                }
            },
            {
                $unwind: {
                    path: "$shopId",
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return { success: true, data: JSON.parse(JSON.stringify(sales)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};



// get sale by id
export const getSaleById = async (id: string) => {
    try {
        await connectDB();

        const sale = await Sale.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy"
                }
            },
            {
                $unwind: {
                    path: "$createdBy",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shopId"
                }
            },
            {
                $unwind: {
                    path: "$shopId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "salesitems",
                    localField: "_id",
                    foreignField: "saleId",
                    as: "salesItems"
                }
            },
            {
                $unwind: {
                    path: "$salesItems",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "salesItems.productId",
                    foreignField: "_id",
                    as: "salesItems.product"
                }
            },
            {
                $unwind: {
                    path: "$salesItems.product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    createdBy: { $first: "$createdBy" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    total_amount: { $first: "$total_amount" },
                    updatedBy: { $first: "$updatedBy" },
                    profit: { $first: "$profit" },
                    sub_total: { $first: "$sub_total" },
                    discount: { $first: "$discount" },
                    shopId: { $first: "$shopId" },
                    // Include any other Sale fields you want here!
                    salesItems: { $push: "$salesItems" }
                }
            }
        ]);


        if (!sale || sale.length === 0) {
            return { success: false, message: "Sale not found" };
        }

        return { success: true, data: JSON.parse(JSON.stringify(sale[0])) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


// update sale details
export const updateSale = async ({ saleId, saleData }: { saleId: string, saleData: any }) => {
    try {
        await connectDB();
        // Find the sale by ID and update their details
        const updatedSale = await Sale.findByIdAndUpdate(
            saleId,
            {
                ...saleData,
            },
            { new: true } // Return the updated document
        );
        if (!updatedSale) {
            return { success: false, message: "Sale not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(updatedSale)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};


// delete sale (soft delete)
export const deleteSale = async (saleId: string) => {
    try {
        await connectDB();

        // 1. Fetch all SalesItems for this sale to revert stock
        const salesItems = await SalesItem.find({ saleId });

        if (salesItems.length > 0) {
            // 2. Revert stock in ShopProduct
            const bulkUpdates = salesItems.map((item) => ({
                updateOne: {
                    filter: { _id: item.shopProductId },
                    update: { $inc: { quantity: item.qty } },
                },
            }));
            await ShopProduct.bulkWrite(bulkUpdates);

            // 3. Mark SalesItems as deleted and suspended
            await SalesItem.updateMany(
                { saleId },
                { isDeleted: true, isSuspended: true }
            );
        }

        // 4. Mark Sale as deleted and suspended
        const updatedSale = await Sale.findByIdAndUpdate(
            saleId,
            { isDeleted: true, isSuspended: true },
            { new: true }
        );

        if (!updatedSale) {
            return { success: false, message: "Sale not found" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(updatedSale)),
            message: "Sale deleted successfully (soft delete)"
        };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
}
