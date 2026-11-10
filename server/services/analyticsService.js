import sellers from "../data/sellers.js";

const calculateChange = (current, previous) => {
  if (previous === 0) return null;

  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const calculateRate = (numerator, denominator) => {
  if (denominator === 0) return 0;

  return Number(((numerator / denominator) * 100).toFixed(2));
};

export const getSellerAnalytics = (sellerId) => {
  const seller = sellers.find((item) => item.sellerId === sellerId);

  if (!seller) {
    throw new Error("Seller not found");
  }

  const current = seller.currentMonth;
  const previous = seller.previousMonth;

  const revenueChange = calculateChange(current.revenue, previous.revenue);

  const orderChange = calculateChange(current.orders, previous.orders);

  const cancellationChange = calculateChange(
    current.cancellationRate,
    previous.cancellationRate,
  );

  const currentConversionRate = calculateRate(
    current.orders,
    current.productViews,
  );

  const previousConversionRate = calculateRate(
    previous.orders,
    previous.productViews,
  );

  const currentReturnRate = calculateRate(current.returns, current.orders);

  const previousReturnRate = calculateRate(previous.returns, previous.orders);

  return {
    sellerId: seller.sellerId,
    sellerName: seller.sellerName,
    category: seller.category,

    revenue: {
      current: current.revenue,
      previous: previous.revenue,
      changePercentage: revenueChange,
    },

    orders: {
      current: current.orders,
      previous: previous.orders,
      changePercentage: orderChange,
    },

    cancellationRate: {
      current: current.cancellationRate,
      previous: previous.cancellationRate,
      changePercentage: cancellationChange,
    },

    averageSellingPrice: {
      current: current.averageSellingPrice,
      previous: previous.averageSellingPrice,
      changePercentage: calculateChange(
        current.averageSellingPrice,
        previous.averageSellingPrice,
      ),
    },

    outOfStockProducts: {
      current: current.outOfStockProducts,
      previous: previous.outOfStockProducts,
      change: current.outOfStockProducts - previous.outOfStockProducts,
    },

    conversionRate: currentConversionRate,
    previousConversionRate,

    returnRate: currentReturnRate,
    previousReturnRate,

    productViews: {
      current: current.productViews,
      previous: previous.productViews,
      changePercentage: calculateChange(
        current.productViews,
        previous.productViews,
      ),
    },

    totalProducts: seller.totalProducts,

    products: seller.products,
  };
};
