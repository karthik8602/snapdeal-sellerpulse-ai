export const agentTools = [
  {
    type: "function",
    function: {
      name: "get_seller_analytics",
      description:
        "Retrieve overall seller business analytics, including current and previous revenue, orders, product views, conversion rate and return rate. Use this first when investigating overall business performance.",
      parameters: {
        type: "object",
        properties: {
          sellerId: {
            type: "string",
            description: "Unique seller ID",
          },
        },
        required: ["sellerId"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "get_product_performance",
      description:
        "Retrieve detailed product information including name, category, price, views, orders, stock, returns, rating and previous-month performance. Can retrieve all products or one specific product.",
      parameters: {
        type: "object",
        properties: {
          sellerId: {
            type: "string",
            description: "Unique seller ID",
          },
          productId: {
            type: "string",
            description: "Optional product ID",
          },
        },
        required: ["sellerId"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "analyze_product_performance",
      description:
        "Analyze the seller's product catalogue. Identify products with high return rates, low conversion, declining orders, low stock and strong performance. Use this to investigate product-level problems.",
      parameters: {
        type: "object",
        properties: {
          sellerId: {
            type: "string",
            description: "Unique seller ID",
          },
        },
        required: ["sellerId"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "analyze_category_performance",
      description:
        "Compare product categories using views, orders, returns, conversion rate and average product price. Identify stronger and weaker categories based on the seller's own data.",
      parameters: {
        type: "object",
        properties: {
          sellerId: {
            type: "string",
            description: "Unique seller ID",
          },
        },
        required: ["sellerId"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "check_inventory",
      description:
        "Identify products with low inventory and products that may need restocking. Use available stock data and flag low-stock products for seller attention.",
      parameters: {
        type: "object",
        properties: {
          sellerId: {
            type: "string",
            description: "Unique seller ID",
          },
        },
        required: ["sellerId"],
        additionalProperties: false,
      },
    },
  },
];
