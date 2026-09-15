import dayjs from "dayjs";

// replace card number with stars
export const subcollectionName = "test";
export const handleMaskCard = (cardNumber: string) => {
  let stars = "";
  for (
    let index = 0;
    index < cardNumber?.length - cardNumber?.slice(-4).length;
    index++
  ) {
    stars += "*";
  }
  return `${stars}${cardNumber?.slice(-4)}`;
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "GHC",
});
export const currencyFormatter = (value: number | bigint) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHC",
  });
  return formatter.format(value);
};

// returns  Expired | Not expired | Not yet | N/A
export const getExpiryStatus = (expiryDate: Date | string | undefined | null) => {
  if (!expiryDate) {
    return "N/A";
  }
  const today = dayjs();
  const expiry = dayjs(expiryDate);
  if (expiry.isBefore(today, "day") || expiry.isSame(today, "day")) {
    return "Expired";
  } else if (expiry.isBefore(today.add(3, "month"), "day")) {
    return "Expiring soon";
  } else {
    return "Not yet";
  }
};


// dayjs(orderData.createdAt).format("ddd DD MMM YYYY HH:mm:ss A")
// format date
export const formatDate = (date: Date) => {
  return date ? dayjs(date).format("ddd DD MMM YYYY HH:mm:ss A") : "";
};
export const formatDateWithoutTime = (date: Date | string | undefined | null) => {
  if (!date) return "N/A";
  return dayjs(date).format("ddd DD MMM YYYY");
};

export function isGreaterThan24HourAgo(date: Date) {
  //                      hour  min  sec  milliseconds
  const twentyFourHrInMs = 24 * 60 * 60 * 1000;

  const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;
  console.log(new Date(date).getTime(), twentyFourHoursAgo);
  console.log(new Date(date).getTime() <= twentyFourHoursAgo);

  return new Date(date).getTime() <= twentyFourHoursAgo;
}

export const checkIfSameDayAsToday = (date: string) => {
  const today = new Date();
  const dateToCheck = new Date(date);
  return today.toDateString() === dateToCheck.toDateString();
}

export const getTotalOrderAmount = (orders: any[]) => {
  return orders.reduce((acc, order) => {
    const orderAmount = order?.total_amount || 0;
    return acc + orderAmount;
  }, 0);
}
export const getTotalOrderProfit = (orders: any[]) => {
  return orders.reduce((acc, order) => {
    const orderAmount = order?.profit || 0;
    return acc + orderAmount;
  }, 0);
}
export const getTotalOrderDiscount = (orders: any[]) => {
  return orders.reduce((acc, order) => {
    const orderAmount = order?.discount || 0;
    return acc + orderAmount;
  }, 0);
}