const sellers = [
  {
    sellerId: "SELLER001",
    sellerName: "Fashion World",
    category: "Footwear",

    currentMonth: {
      revenue: 450000,
      orders: 320,
      productViews: 12000,
      returns: 58,
    },

    previousMonth: {
      revenue: 600000,
      orders: 400,
      productViews: 15000,
      returns: 40,
    },

    products: [
      {
        productId: "P101",
        name: "Running Shoes",
        price: 1499,
        views: 5000,
        orders: 100,
        stock: 25,
        returns: 25,
      },
      {
        productId: "P102",
        name: "Casual Sneakers",
        price: 999,
        views: 4000,
        orders: 150,
        stock: 120,
        returns: 10,
      },
      {
        productId: "P103",
        name: "Sports Sandals",
        price: 799,
        views: 3000,
        orders: 70,
        stock: 5,
        returns: 23,
      },
    ],
  },
];

export default sellers;
