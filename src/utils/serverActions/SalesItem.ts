"use server";

import { connectDB } from "@/lib/mongodb";
import SalesItem from "@/models/SalesItem";
import ShopProduct from "@/models/ShopProduct";
import mongoose from "mongoose";


export const getSaleItemsBySaleId = async (saleId: string) => {
    try {
        await connectDB();
        const saleItems = await SalesItem.aggregate([
            { $match: { saleId: new mongoose.Types.ObjectId(saleId) } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: "$productId" },
        ]);
        return { success: true, data: JSON.parse(JSON.stringify(saleItems)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};

export const getSalesItemsByProductId = async ({ productId, page = 1, shopId }: { productId: string, page?: number, shopId?: string }) => {
    try {
        await connectDB();
        const skip = (page - 1) * 50;

        const pipeline: any[] = [
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        ];

        if (shopId) {
            pipeline.push(
                {
                    $lookup: {
                        from: "sales",
                        localField: "saleId",
                        foreignField: "_id",
                        as: "saleId",
                    },
                },
                { $unwind: "$saleId" },
                { $match: { "saleId.shopId": new mongoose.Types.ObjectId(shopId) } }
            );
        }

        pipeline.push(
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: 50 },
                        {
                            $lookup: {
                                from: "products",
                                localField: "productId",
                                foreignField: "_id",
                                as: "productId",
                            },
                        },
                        { $unwind: "$productId" },
                        ...(shopId ? [] : [
                            {
                                $lookup: {
                                    from: "sales",
                                    localField: "saleId",
                                    foreignField: "_id",
                                    as: "saleId",
                                },
                            },
                            { $unwind: "$saleId" }
                        ]),
                        {
                            $lookup: {
                                from: "shops",
                                localField: "saleId.shopId",
                                foreignField: "_id",
                                as: "saleId.shopId",
                            },
                        },
                        { $unwind: "$saleId.shopId" },
                        {
                            $lookup: {
                                from: "shopproducts",
                                localField: "shopProductId",
                                foreignField: "_id",
                                as: "shopProductId",
                            },
                        },
                        { $unwind: { path: "$shopProductId", preserveNullAndEmptyArrays: true } },
                    ]
                }
            }
        );

        const result = await SalesItem.aggregate(pipeline);

        const total = result[0]?.metadata[0]?.total || 0;
        const salesItems = result[0]?.data || [];

        return { success: true, data: JSON.parse(JSON.stringify(salesItems)), total, page };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
}


// add multiple salesItem
interface SalesItemInput {
    _id: string;
    shopProductId: string;
    productId: string;
    total_amount: number;
    unit_price: number;
    profit: number;
    qty: number;
    createdBy: string;
}

export const addSalesItems = async ({
    saleId,
    salesItems,
}: {
    saleId: string;
    salesItems: SalesItemInput[];
}): Promise<{ success: boolean; message?: string }> => {
    try {
        await connectDB();

        // Prepare sale items with the saleId reference
        const saleObjectId = new mongoose.Types.ObjectId(saleId);
        const saleItemsWithSaleId = salesItems.map((item) => ({
            shopProductId: item.shopProductId,
            productId: item.productId,
            total_amount: item.total_amount,
            unit_price: item.unit_price,
            profit: item.profit,
            qty: item.qty,
            createdBy: item.createdBy,
            saleId: saleObjectId,
        }));

        // Insert all sale items
        await SalesItem.insertMany(saleItemsWithSaleId);

        // Prepare bulk update operations for ShopProduct
        const bulkUpdates = salesItems.map((item) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(item.shopProductId) },
                update: { $inc: { quantity: -item.qty } },
            },
        }));

        await ShopProduct.bulkWrite(bulkUpdates);

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "An error occurred",
        };
    }
};


// delete salesItems
export const deleteSalesItems = async (salesItems: SalesItemInput[]) => {
    try {
        await connectDB();
        const bulkUpdates = salesItems.map((item) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(item.shopProductId) },
                update: { $inc: { quantity: item.qty } },
            },
        }));

        await ShopProduct.bulkWrite(bulkUpdates);

        await SalesItem.deleteMany({ _id: { $in: salesItems.map((item) => item._id) } });

        return { success: true };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }

}