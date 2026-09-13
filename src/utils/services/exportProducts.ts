import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

export interface ExportProductItem {
  _id?: string;
  sku?: number | string;
  name?: string;
  costPrice?: number;
  sellingPrice?: number;
  currentStock?: number;
  expiryDate?: string | Date;
  shopProducts?: Array<{
    quantity?: number;
    shopId?: any;
  }>;
}


export const calculateProductExportRow = (product: ExportProductItem) => {
  const shopsQty =
    product.shopProducts && product.shopProducts.length > 0
      ? product.shopProducts
        .map((sp) => Number(sp.quantity) || 0)
        .reduce((acc, curr) => acc + curr, 0)
      : 0;

  const warehouseQty = Number(product.currentStock) || 0;
  const totalQty = warehouseQty + shopsQty;

  let expiryStatus = "N/A";
  let formattedExpiry = "";

  if (product.expiryDate) {
    const today = dayjs();
    const expiry = dayjs(product.expiryDate);
    formattedExpiry = expiry.format("DD/MM/YYYY");

    if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
      expiryStatus = "Expired";
    } else if (expiry.isBefore(today.add(3, "month"), "day")) {
      expiryStatus = "Expiring soon";
    } else {
      expiryStatus = "Not yet";
    }
  }

  return {
    sku: product.sku !== undefined && product.sku !== null ? String(product.sku) : "",
    name: product.name ? product.name.toUpperCase() : "",
    costPrice: Number(product.costPrice || 0),
    sellingPrice: Number(product.sellingPrice || 0),
    warehouseQty,
    shopsQty,
    totalQty,
    formattedExpiry,
    expiryStatus,
  };
};

export const exportProductsToXLSX = (
  products: ExportProductItem[],
  filterName = "all"
) => {
  if (!products || products.length === 0) {
    throw new Error("No products available to export.");
  }

  const rows = products.map((product) => {
    const data = calculateProductExportRow(product);
    return {
      "SKU": data.sku,
      "Product Name": data.name,
      "Cost Price (GHC)": Number(data.costPrice.toFixed(2)),
      "Selling Price (GHC)": Number(data.sellingPrice.toFixed(2)),
      "Warehouse Qty": data.warehouseQty,
      "Qty in Shops": data.shopsQty,
      "Total Qty": data.totalQty,
      "Expiry Date": data.formattedExpiry,
      "Expiry Status": data.expiryStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set friendly column widths
  worksheet["!cols"] = [
    { wch: 12 }, // SKU
    { wch: 38 }, // Product Name
    { wch: 18 }, // Cost Price
    { wch: 18 }, // Selling Price
    { wch: 16 }, // Warehouse Qty
    { wch: 16 }, // Qty in Shops
    { wch: 14 }, // Total Qty
    { wch: 16 }, // Expiry Date
    { wch: 16 }, // Expiry Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const filterSuffix =
    filterName && filterName !== "all" ? `_${filterName}` : "_all";
  const fileName = `Products${filterSuffix}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

export const exportProductsToPDF = (
  products: ExportProductItem[],
  filterName = "all"
) => {
  if (!products || products.length === 0) {
    throw new Error("No products available to export.");
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [0, 32, 91]; // #00205B
  const subtextColor: [number, number, number] = [96, 90, 90]; // #605A5A

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text("SH PHARMACY - PRODUCTS INVENTORY REPORT", 14, 15);

  // Subtitle / metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...subtextColor);

  const filterLabel =
    filterName === "expiringSoon"
      ? "Expiring Soon"
      : filterName === "expired"
        ? "Expired"
        : "All Products";

  const generatedDate = dayjs().format("ddd, DD MMM YYYY, hh:mm A");
  doc.text(`Generated: ${generatedDate}  |  Filter: ${filterLabel}  |  Total Products: ${products.length}`, 14, 21);

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(14, 24, 283, 24);

  // Calculate totals for summary footer
  let totalWarehouse = 0;
  let totalShops = 0;
  let totalStock = 0;

  const bodyData = products.map((product) => {
    const row = calculateProductExportRow(product);
    totalWarehouse += row.warehouseQty;
    totalShops += row.shopsQty;
    totalStock += row.totalQty;

    return [
      row.sku,
      row.name,
      row.costPrice.toFixed(2),
      row.sellingPrice.toFixed(2),
      String(row.warehouseQty),
      String(row.shopsQty),
      String(row.totalQty),
      row.formattedExpiry,
      row.expiryStatus,
    ];
  });

  const footData = [
    [
      "",
      `TOTALS (${products.length} Items)`,
      "",
      "",
      String(totalWarehouse),
      String(totalShops),
      String(totalStock),
      "",
      "",
    ],
  ];

  autoTable(doc, {
    startY: 27,
    head: [
      [
        "SKU",
        "Product Name",
        "Cost (GHC)",
        "Price (GHC)",
        "Whse Qty",
        "Shop Qty",
        "Total Qty",
        "Expiry Date",
        "Status",
      ],
    ],
    body: bodyData,
    foot: footData,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 30, 30],
      valign: "middle",
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [246, 249, 254],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 16 }, // SKU
      1: { halign: "left" },                  // Name (auto)
      2: { halign: "right", cellWidth: 24 },  // Cost Price
      3: { halign: "right", cellWidth: 24 },  // Selling Price
      4: { halign: "center", cellWidth: 20 }, // Warehouse Qty
      5: { halign: "center", cellWidth: 20 }, // Shops Qty
      6: { halign: "center", cellWidth: 20 }, // Total Qty
      7: { halign: "center", cellWidth: 24 }, // Expiry Date
      8: { halign: "center", cellWidth: 24 }, // Status
    },
    footStyles: {
      fillColor: [230, 236, 247],
      textColor: primaryColor,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);

      // Left footer
      doc.text("SH Pharmacy Management System", 14, 203);

      // Right footer
      const pageStr = `Page ${currentPage} of ${pageCount}`;
      doc.text(pageStr, 283 - doc.getTextWidth(pageStr), 203);
    },
  });

  const filterSuffix =
    filterName && filterName !== "all" ? `_${filterName}` : "_all";
  const fileName = `Products${filterSuffix}_${dayjs().format("YYYY-MM-DD")}.pdf`;

  doc.save(fileName);
};

export const exportShopProductsToXLSX = (
  shopProducts: any[],
  shopName = "Shop",
  isAdmin = false
) => {
  if (!shopProducts || shopProducts.length === 0) {
    throw new Error("No products available to export.");
  }

  const rows = shopProducts.map((item) => {
    const product = item.product || {};
    const qty = Number(item.quantity || 0);

    let expiryStatus = "N/A";
    let formattedExpiry = "";

    if (product.expiryDate) {
      const today = dayjs();
      const expiry = dayjs(product.expiryDate);
      formattedExpiry = expiry.format("DD/MM/YYYY");

      if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
        expiryStatus = "Expired";
      } else if (expiry.isBefore(today.add(3, "month"), "day")) {
        expiryStatus = "Expiring soon";
      } else {
        expiryStatus = "Not yet";
      }
    }

    const rowObj: Record<string, any> = {
      "SKU": product.sku !== undefined && product.sku !== null ? String(product.sku) : "",
      "Product Name": product.name ? String(product.name).toUpperCase() : "",
    };

    if (isAdmin) {
      rowObj["Cost Price (GHC)"] = Number(Number(product.costPrice || 0).toFixed(2));
    }

    rowObj["Selling Price (GHC)"] = Number(Number(product.sellingPrice || 0).toFixed(2));
    rowObj["Quantity"] = qty;
    rowObj["Expiry Date"] = formattedExpiry;
    rowObj["Expiry Status"] = expiryStatus;

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 12 }, // SKU
    { wch: 38 }, // Product Name
    ...(isAdmin ? [{ wch: 18 }] : []), // Cost Price
    { wch: 18 }, // Selling Price
    { wch: 14 }, // Quantity
    { wch: 16 }, // Expiry Date
    { wch: 16 }, // Expiry Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shop Products");

  const cleanShopName = shopName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanShopName}_Products_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

export const exportShopProductsToPDF = (
  shopProducts: any[],
  shopName = "Shop",
  isAdmin = false
) => {
  if (!shopProducts || shopProducts.length === 0) {
    throw new Error("No products available to export.");
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [0, 32, 91]; // #00205B
  const subtextColor: [number, number, number] = [96, 90, 90]; // #605A5A

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(`SH PHARMACY - ${shopName.toUpperCase()} INVENTORY REPORT`, 14, 15);

  // Subtitle / metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...subtextColor);

  const generatedDate = dayjs().format("ddd, DD MMM YYYY, hh:mm A");
  doc.text(`Shop: ${shopName}  |  Generated: ${generatedDate}  |  Total Products: ${shopProducts.length}`, 14, 21);

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(14, 24, 283, 24);

  let totalQty = 0;

  const bodyData = shopProducts.map((item) => {
    const product = item.product || {};
    const qty = Number(item.quantity || 0);
    totalQty += qty;

    let expiryStatus = "N/A";
    let formattedExpiry = "";

    if (product.expiryDate) {
      const today = dayjs();
      const expiry = dayjs(product.expiryDate);
      formattedExpiry = expiry.format("DD/MM/YYYY");

      if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
        expiryStatus = "Expired";
      } else if (expiry.isBefore(today.add(3, "month"), "day")) {
        expiryStatus = "Expiring soon";
      } else {
        expiryStatus = "Not yet";
      }
    }

    const row = [
      product.sku !== undefined && product.sku !== null ? String(product.sku) : "",
      product.name ? String(product.name).toUpperCase() : "",
    ];

    if (isAdmin) {
      row.push(Number(product.costPrice || 0).toFixed(2));
    }

    row.push(
      Number(product.sellingPrice || 0).toFixed(2),
      String(qty),
      formattedExpiry,
      expiryStatus
    );

    return row;
  });

  const headers = [
    "SKU",
    "Product Name",
    ...(isAdmin ? ["Cost (GHC)"] : []),
    "Price (GHC)",
    "Quantity",
    "Expiry Date",
    "Status",
  ];

  const footData = [
    [
      "",
      `TOTALS (${shopProducts.length} Items)`,
      ...(isAdmin ? [""] : []),
      "",
      String(totalQty),
      "",
      "",
    ],
  ];

  const columnStyles: Record<number, any> = {
    0: { halign: "center", cellWidth: 18 }, // SKU
    1: { halign: "left" },                  // Product Name
  };

  let colIdx = 2;
  if (isAdmin) {
    columnStyles[colIdx++] = { halign: "right", cellWidth: 26 }; // Cost Price
  }
  columnStyles[colIdx++] = { halign: "right", cellWidth: 26 }; // Selling Price
  columnStyles[colIdx++] = { halign: "center", cellWidth: 22 }; // Quantity
  columnStyles[colIdx++] = { halign: "center", cellWidth: 26 }; // Expiry Date
  columnStyles[colIdx++] = { halign: "center", cellWidth: 26 }; // Status

  autoTable(doc, {
    startY: 27,
    head: [headers],
    body: bodyData,
    foot: footData,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 30, 30],
      valign: "middle",
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [246, 249, 254],
    },
    columnStyles,
    footStyles: {
      fillColor: [230, 236, 247],
      textColor: primaryColor,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);

      // Left footer
      doc.text(`SH Pharmacy - ${shopName}`, 14, 203);

      // Right footer
      const pageStr = `Page ${currentPage} of ${pageCount}`;
      doc.text(pageStr, 283 - doc.getTextWidth(pageStr), 203);
    },
  });

  const cleanShopName = shopName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanShopName}_Products_${dayjs().format("YYYY-MM-DD")}.pdf`;

  doc.save(fileName);
};


