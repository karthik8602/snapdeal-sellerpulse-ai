import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Package,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  RotateCcw,
  Mic,
  Bell,
  RefreshCw,
  AlertTriangle,
  Percent,
  Eye,
} from "lucide-react";

import VoiceAssistant from "./components/VoiceAssistant";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;
const SELLER_ID = "SELLER001";

function App() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await fetch(
        `${API_URL}/api/sellers/${SELLER_ID}/analytics`,
      );

      const data = await result.json();

      if (!result.ok || !data.success) {
        throw new Error(data.message || "Failed to load analytics.");
      }

      setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(value ?? 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <RefreshCw className="spin" size={28} />
        <p>Loading SellerPulse AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <AlertTriangle size={28} />
        <p>{error}</p>
        <button onClick={fetchAnalytics}>Try Again</button>
      </div>
    );
  }

  // Determine whether a change is good or bad.
  const getChangeStatus = (value, inverse = false) => {
    if (value === null || value === undefined || value === 0) {
      return "neutral";
    }

    const positive = value > 0;

    if (inverse) {
      return positive ? "negative" : "positive";
    }

    return positive ? "positive" : "negative";
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.revenue.current),
      comparison: `${Math.abs(analytics.revenue.changePercentage)}% ${
        analytics.revenue.changePercentage < 0 ? "decrease" : "increase"
      } vs last month`,
      status: getChangeStatus(analytics.revenue.changePercentage),
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: formatNumber(analytics.orders.current),
      comparison: `${Math.abs(analytics.orders.changePercentage)}% ${
        analytics.orders.changePercentage < 0 ? "decrease" : "increase"
      } vs last month`,
      status: getChangeStatus(analytics.orders.changePercentage),
      icon: ShoppingBag,
    },
    {
      title: "Cancellation Rate",
      value: `${analytics.cancellationRate.current}%`,
      comparison: `${analytics.cancellationRate.current - analytics.cancellationRate.previous > 0 ? "+" : ""}${(
        analytics.cancellationRate.current - analytics.cancellationRate.previous
      ).toFixed(1)} percentage points vs last month`,
      status: getChangeStatus(
        analytics.cancellationRate.current -
          analytics.cancellationRate.previous,
        true,
      ),
      icon: RotateCcw,
    },
    {
      title: "Average Selling Price",
      value: formatCurrency(analytics.averageSellingPrice.current),
      comparison: `${analytics.averageSellingPrice.changePercentage ?? 0}% vs last month`,
      status: getChangeStatus(analytics.averageSellingPrice.changePercentage),
      icon: IndianRupee,
    },
    {
      title: "Out-of-Stock Products",
      value: formatNumber(analytics.outOfStockProducts.current),
      comparison: `+${analytics.outOfStockProducts.change} vs last month`,
      status: getChangeStatus(analytics.outOfStockProducts.change, true),
      icon: AlertTriangle,
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      comparison: "Current month",
      status: "neutral",
      icon: TrendingUp,
    },
    {
      title: "Return Rate",
      value: `${analytics.returnRate}%`,
      comparison: "Current month",
      status: "neutral",
      icon: RotateCcw,
    },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>
            SellerPulse <b>AI</b>
          </span>
        </div>

        <div className="nav-section">
          <p className="nav-label">WORKSPACE</p>

          <div className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </div>

          <div className="nav-item">
            <Package size={19} />
            Products
          </div>

          <div className="nav-item">
            <Mic size={19} />
            AI Assistant
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="seller-avatar">FW</div>

          <div>
            <strong>{analytics.sellerName}</strong>
            <small>{SELLER_ID}</small>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Business Overview</h1>

            <p className="page-subtitle">
              Monitor your store performance and grow your business.
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="refresh-button"
              onClick={fetchAnalytics}
              title="Refresh analytics"
            >
              <RefreshCw size={17} />
            </button>

            <button className="notification-button">
              <Bell size={19} />
            </button>

            <div className="profile-avatar">FW</div>
          </div>
        </header>

        {/* Seller Information */}
        <section className="seller-banner">
          <div>
            <span className="seller-tag">SELLER ACCOUNT</span>

            <h2>{analytics.sellerName}</h2>

            <p>
              {analytics.category} · {SELLER_ID}
            </p>
          </div>

          <div className="seller-status">
            <span className="status-dot"></span>
            Account Overview
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Performance Metrics</h2>
              <p>Current business performance compared with last month.</p>
            </div>
          </div>

          <div className="metrics-grid">
            {metricCards.map((metric) => {
              const Icon = metric.icon;

              return (
                <div className="metric-card" key={metric.title}>
                  <div className="metric-top">
                    <span>{metric.title}</span>

                    <div className="metric-icon">
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3>{metric.value}</h3>

                  <div className={`metric-change ${metric.status}`}>
                    {metric.status === "negative" ? (
                      <TrendingDown size={15} />
                    ) : metric.status === "positive" ? (
                      <TrendingUp size={15} />
                    ) : null}

                    <span>{metric.comparison}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Product Performance */}
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Product Performance</h2>
              <p>Explore product visibility, orders, inventory and returns.</p>
            </div>
          </div>

          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Orders</th>
                  <th>Stock</th>
                  <th>Returns</th>
                  <th>Return Rate</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>
                {analytics.products.map((product) => {
                  const returnRate = product.orders
                    ? (product.returns / product.orders) * 100
                    : 0;

                  return (
                    <tr key={product.productId}>
                      <td>
                        <div className="product-name">
                          <strong>{product.name}</strong>
                          <small>{product.productId}</small>
                        </div>
                      </td>

                      <td>{product.category || "N/A"}</td>

                      <td>{formatCurrency(product.price)}</td>

                      <td>{formatNumber(product.views)}</td>

                      <td>{formatNumber(product.orders)}</td>

                      <td>
                        <span
                          className={
                            product.stock === 0
                              ? "return-high"
                              : product.stock <= 10
                                ? "stock-low"
                                : "stock-good"
                          }
                        >
                          {product.stock === 0 ? "Out of stock" : product.stock}
                        </span>
                      </td>

                      <td>{product.returns}</td>

                      <td>
                        <span
                          className={
                            returnRate >= 20 ? "return-high" : "return-normal"
                          }
                        >
                          {returnRate.toFixed(1)}%
                        </span>
                      </td>

                      <td>{product.rating ? `★ ${product.rating}` : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Voice Assistant */}
        <section className="section assistant-section">
          <div className="section-heading">
            <div>
              <h2>Your AI Business Advisor</h2>

              <p>Talk to your personal Virtual Key Account Manager.</p>
            </div>

            <span className="ai-badge">AI POWERED</span>
          </div>

          <div className="assistant-card">
            <div className="assistant-info">
              <div className="assistant-icon">
                <Mic size={25} />
              </div>

              <h3>SellerPulse AI Assistant</h3>

              <p>
                Ask questions about sales, cancellations, inventory, product
                visibility and business growth.
              </p>
            </div>

            <VoiceAssistant />
          </div>
        </section>

        <footer>SellerPulse AI · Virtual Key Account Manager</footer>
      </main>
    </div>
  );
}

export default App;
