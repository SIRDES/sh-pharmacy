import React, { CSSProperties } from "react";
import { currencyFormatter, formatDate } from "@/utils/services/utils";

interface SaleRecieptPDFProps {
    orderData: {
        _id: string;
        createdAt: string;
        total_amount: number;
        sub_total: number;
        discount: number;
        shopId?: {
            name: string;
            tin?: string;
            tel?: string;
        };
        createdBy?: {
            name: string;
        };
        salesItems: Array<{
            product: {
                name: string;
            };
            qty: number;
            unit_price: number;
            total_amount: number;
        }>;
        cashReceived?: number;
        changeReturned?: number;
        drawer?: string;
        internalData?: string;
        receiptSignature?: string;
        mrc?: string;
    };
}

export default function SaleRecieptPDF({ orderData }: SaleRecieptPDFProps) {
    const {
        sub_total = 0,
        discount = 0,
        total_amount = 0,
        salesItems = [],
        shopId,
        createdAt,
        createdBy,
    } = orderData;

    // Ghana Tax Calculations (GETFL 2.5%, NHIL 2.5%, VAT 15%)
    // These are usually calculated on the base (VAT Exclusive) amount.
    // In this model, sub_total is the total before discount.
    // Let's assume sub_total is VAT Inclusive for now or calculate from a base.
    // Based on the reference image: Base + 2.5% + 2.5% + 15% = Total
    // Total = Base * 1.2 => Base = Total / 1.2
    // const vatExclusive = (sub_total - discount) / 1.2;
    // const getfl = vatExclusive * 0.025;
    // const nhil = vatExclusive * 0.025;
    // const vat = vatExclusive * 0.15;

    const receiptStyles: CSSProperties = {
        width: "80mm",
        padding: "10mm 4mm",
        backgroundColor: "#fff",
        color: "#000",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "12px",
        lineHeight: "1.4",
        margin: "0 auto",
        boxSizing: "border-box"
    };

    const sectionDivider: CSSProperties = {
        borderTop: "1px dashed #000",
        margin: "8px 0"
    };

    const textCenter: CSSProperties = { textAlign: "center" };
    const textRight: CSSProperties = { textAlign: "right" };
    const textLeft: CSSProperties = { textAlign: "left" };
    const bold: CSSProperties = { fontWeight: "bold" };

    return (
        <div style={receiptStyles} id="sale-receipt">
            {/* Header */}
            <div style={textCenter}>
                <div style={{ textDecoration: "underline", marginBottom: "4px" }}>Sale Receipt</div>
                <div style={{ ...bold, fontSize: "16px", textTransform: "uppercase" }}>
                    STEVHENS PHARMACY
                    {/* {shopId?.name || "MAXMART 37"} */}
                </div>
                {/* <div>TIN: {shopId?.tin || "C0003946258"}</div> */}
                <div>Tel: {shopId?.tel || "0302999979"}</div>
                <div>Receipt #: {orderData._id?.slice(-10).toUpperCase() || "PS53019103"}</div>
                {/* <div>Evat Invoice Number:</div>
                <div style={{ fontSize: "10px", wordBreak: "break-all" }}>
                    {orderData._id?.toUpperCase() || "PS5301910342202633617PM"}
                </div> */}
                <div>Receipt Date: {formatDate(new Date(createdAt))}</div>
            </div>

            <div style={sectionDivider}></div>
            {/* <div style={{ ...textCenter, ...bold }}>Sale Receipt</div> */}

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "4px" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                        <th style={{ ...textLeft, width: "50%" }}>Description</th>
                        <th style={textCenter}>QTY</th>
                        <th style={textRight}>Price</th>
                        <th style={textRight}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {salesItems.map((item, index) => (
                        <tr key={index} style={{ verticalAlign: "top" }}>
                            <td style={textLeft}>{item.product.name.toUpperCase()}</td>
                            <td style={textCenter}>{item.qty.toFixed(2)}</td>
                            <td style={textRight}>{item.unit_price.toFixed(2)}</td>
                            <td style={textRight}>{item.total_amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={sectionDivider}></div>

            {/* Totals Section */}
            <div>
                {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Number Of Items: {salesItems.length}</span>
                </div> */}
                {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>VAT Exclusive:</span>
                    <span>{vatExclusive.toFixed(3)}</span>
                </div> */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Sub Total:</span>
                    <span>{sub_total.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Discount:</span>
                    <span>{discount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total:</span>
                    <span>{total_amount.toFixed(2)}</span>
                </div>
                {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GETFL 2.5%:</span>
                    <span>{getfl.toFixed(3)}</span>
                </div> */}
                {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>NHIL 2.5%:</span>
                    <span>{nhil.toFixed(3)}</span>
                </div> */}
                {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>VAT 15%:</span>
                    <span>{vat.toFixed(3)}</span>
                </div> */}
            </div>

            <div style={{ margin: "8px 0" }}></div>

            {/* <div style={{ ...bold, display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span>VAT Inclusive</span>
                <span>GHS {total_amount.toFixed(2)}</span>
            </div> */}


            <div style={sectionDivider}></div>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Cash Back</span>
                <span>GHS 0.00</span>
            </div> */}
            {/* <div style={sectionDivider}></div> */}

            {/* Metadata Section */}
            {/* <div style={{ fontSize: "10px", marginTop: "8px" }}> */}
            {/* <div>Your Assistant Was {createdBy?.name || "GRACE"}</div> */}
            {/* <div>Drawer: {drawer}</div> */}
            {/* <div>DC ID: E000003001</div> */}
            {/* <div style={{ wordBreak: "break-all" }}>INTERNAL DATA: {internalData}</div> */}
            {/* <div style={{ wordBreak: "break-all" }}>RECEIPT SIGNATURE: {receiptSignature}</div> */}
            {/* <div>RECEIPT NUMBER: {orderData._id?.slice(0, 15).toUpperCase()}</div>
                <div>MRC: {mrc}</div>
                <div>ITEM COUNT: {salesItems.reduce((acc, curr) => acc + curr.qty, 0)}</div> */}
            {/* <div>SDC DATE & TIME: {formatDate(new Date(createdAt))}</div> */}
            {/* <div>TOTAL AMOUNT BEFORE DISCOUNT: {sub_total.toFixed(2)}</div> */}
            {/* </div> */}

            <div style={{ ...textCenter, marginTop: "12px", fontSize: "10px" }}>
                {/* <div>Order online maxmartonline.com / IOS / Playstore</div> */}
                <div>Your Assistant Was {createdBy?.name || "GRACE"}</div>
                <div style={bold}>THANKS FOR SHOPPING WITH US</div>
                <div style={bold}>Goods sold are not returnable</div>
                {/* <div>HOTLINE 0302999979</div> */}
            </div>
        </div>
    );
}
