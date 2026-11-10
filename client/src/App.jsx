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
    }).format(value);

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
        <p>{error}</p>
        <button onClick={fetchAnalytics}>Try Again</button>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.revenue.current),
      change: analytics.revenue.changePercentage,
      icon: IndianRupee,
      type: "currency",
    },
    {
      title: "Total Orders",
      value: analytics.orders.current,
      change: analytics.orders.changePercentage,
      icon: ShoppingBag,
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
    },
    {
      title: "Return Rate",
      value: `${analytics.returnRate}%`,
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

        {/* Seller Info */}
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

        {/* Metrics */}
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Performance Metrics</h2>
              <p>Your current business performance</p>
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

                  {metric.change !== undefined && (
                    <div className="metric-change negative">
                      <TrendingDown size={15} />
                      {Math.abs(metric.change)}% vs previous month
                    </div>
                  )}

                  {metric.change === undefined && (
                    <p className="metric-description">Current month</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Products */}
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Product Performance</h2>
              <p>Understand how your products are performing.</p>
            </div>
          </div>

          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Orders</th>
                  <th>Stock</th>
                  <th>Returns</th>
                  <th>Return Rate</th>
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

                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.views.toLocaleString("en-IN")}</td>
                      <td>{product.orders}</td>
                      <td>
                        <span
                          className={
                            product.stock <= 10 ? "stock-low" : "stock-good"
                          }
                        >
                          {product.stock}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Voice Assistant */}
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
                Ask questions about sales, product performance, inventory and
                business growth.
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
