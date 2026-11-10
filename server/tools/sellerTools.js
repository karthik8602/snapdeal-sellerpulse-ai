import sellers from "../data/sellers.js";
import { getSellerAnalytics } from "../services/analyticsService.js";

// Find seller and validate seller ID
const findSeller = (sellerId) => {
  const seller = sellers.find((item) => item.sellerId === sellerId);

  if (!seller) {
    throw new Error("Seller not found");
  }

  return seller;
};

// Tool 1: Get complete seller analytics
export const getSellerAnalyticsTool = (sellerId) => {
  return getSellerAnalytics(sellerId);
};

// Tool 2: Get individual or all product details
export const getProductPerformanceTool = (sellerId, productId) => {
  const seller = findSeller(sellerId);

  if (productId) {
    const product = seller.products.find(
      (item) => item.productId === productId,
    );

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  return seller.products;
};

// Tool 3: Analyze product performance
export const analyzeProductPerformanceTool = (sellerId) => {
  const seller = findSeller(sellerId);

  return seller.products.map((product) => {
    const conversionRate =
      product.views > 0 ? (product.orders / product.views) * 100 : 0;

    const returnRate =
      product.orders > 0 ? (product.returns / product.orders) * 100 : 0;

    const orderChange =
      product.previousOrders > 0
        ? ((product.orders - product.previousOrders) / product.previousOrders) *
          100
        : null;

    return {
      productId: product.productId,
      name: product.name,
      category: product.category,
      price: product.price,
      views: product.views,
      orders: product.orders,
      stock: product.stock,
      returns: product.returns,
      rating: product.rating,

      conversionRate: Number(conversionRate.toFixed(2)),
      returnRate: Number(returnRate.toFixed(2)),

      previousOrders: product.previousOrders,
      previousReturns: product.previousReturns,

      orderChangePercentage:
        orderChange === null ? null : Number(orderChange.toFixed(2)),

      flags: {
        highReturnRate: returnRate >= 20,
        lowStock: product.stock <= 10,
        decliningOrders: orderChange !== null && orderChange < 0,
        lowConversion: conversionRate < 2,
      },
    };
  });
};

// Tool 4: Analyze category performance
export const analyzeCategoryPerformanceTool = (sellerId) => {
  const seller = findSeller(sellerId);

  const categories = {};

  seller.products.forEach((product) => {
    const category = product.category || "Uncategorized";

    if (!categories[category]) {
      categories[category] = {
        category,
        productCount: 0,
        totalViews: 0,
        totalOrders: 0,
        totalReturns: 0,
        totalPrice: 0,
      };
    }

    const item = categories[category];

    item.productCount += 1;
    item.totalViews += product.views;
    item.totalOrders += product.orders;
    item.totalReturns += product.returns;
    item.totalPrice += product.price;
  });

  return Object.values(categories).map((item) => ({
    ...item,

    averagePrice: Number((item.totalPrice / item.productCount).toFixed(2)),

    conversionRate:
      item.totalViews > 0
        ? Number(((item.totalOrders / item.totalViews) * 100).toFixed(2))
        : 0,

    returnRate:
      item.totalOrders > 0
        ? Number(((item.totalReturns / item.totalOrders) * 100).toFixed(2))
        : 0,
  }));
};

// Tool 5: Check inventory
export const checkInventoryTool = (sellerId) => {
  const seller = findSeller(sellerId);

  return seller.products.map((product) => ({
    productId: product.productId,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    orders: product.orders,

    inventoryStatus:
      product.stock <= 5
        ? "Critical"
        : product.stock <= 10
          ? "Low"
          : "Available",

    needsRestocking: product.stock <= 10,
  }));
};
