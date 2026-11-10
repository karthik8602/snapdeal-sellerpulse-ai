import sellers from "../data/sellers.js";

export const getSellerAnalytics = (sellerId) => {
  const seller = sellers.find((item) => item.sellerId === sellerId);

  if (!seller) {
    throw new Error("Seller not found");
  }

  const current = seller.currentMonth;
  const previous = seller.previousMonth;

  const revenueChange =
    ((current.revenue - previous.revenue) / previous.revenue) * 100;

  const orderChange =
    ((current.orders - previous.orders) / previous.orders) * 100;

  const conversionRate = (current.orders / current.productViews) * 100;

  const returnRate = (current.returns / current.orders) * 100;

  return {
    sellerName: seller.sellerName,
    category: seller.category,

    revenue: {
      current: current.revenue,
      previous: previous.revenue,
      changePercentage: Number(revenueChange.toFixed(2)),
    },

    orders: {
      current: current.orders,
      previous: previous.orders,
      changePercentage: Number(orderChange.toFixed(2)),
    },

    conversionRate: Number(conversionRate.toFixed(2)),
    returnRate: Number(returnRate.toFixed(2)),

    products: seller.products,
  };
};
