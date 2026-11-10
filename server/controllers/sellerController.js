import { getSellerAnalytics } from "../services/analyticsService.js";

export const getAnalytics = (req, res) => {
  try {
    const analytics = getSellerAnalytics(req.params.sellerId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
