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


// dayjs(orderData.createdAt).format("ddd DD MMM YYYY HH:mm:ss A")
// format date
export const formatDate = (date: Date) => {
  return date ? dayjs(date).format("ddd DD MMM YYYY HH:mm:ss A") : "";
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