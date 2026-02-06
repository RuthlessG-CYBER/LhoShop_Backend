import express from "express";
import {
  adminlogin,
  adminregister,
} from "../controllers/admin.auth.controller.js";
import { login, register, addProfileImage, getProfileImageByUserId } from "../controllers/auth.controller.js";
import {
  getProducts,
  getProductById,
  createProduct,
  editProduct,
  deleteProduct,
  createOrder,
  verifyPayment,
} from "../controllers/product.controller.js";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controllers/cart.controller.js";
import {
  getOrders,
  getOrderByUserId,
  updateOrderStatus,
} from "../controllers/orders.controller.js";
import {
  addAddress,
  getAllAddresses,
  deleteAddress,
} from "../controllers/user.controller.js";
import {
  customerCount,
  orderCount,
  totalProducts,
  totalRevenue,
  getAllUserWithDetails,
  getAllPayments,
  downloadInvoice,
  adminCount,
  managerCount,
  supportCount,
  superAdminCount,
  usersReport,
  productsReport,
  adminRoleReport,
  salesReport,
  downloadSalesReportPDF,
  downloadUserRoleReportPDF,
  downloadProductStockReportPDF,
  downloadAdminRoleReportPDF,
  getTopCategories,
  getRecentOrders,
  getOrdersChart,
  getRevenueChart,
  exportDashboardPDF
} from "../controllers/admin.panel.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  getNotifications,
  totalNotifications,
  readNotification,
  totalUnreadNotifications,
  totalReadNotifications,
} from "../controllers/notification.controller.js";

import {
  getTickets,
  createTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketByEmail,
} from "../controllers/ticket.controller.js";

export const router = express.Router();

// APP

// Auth(Customer)
router.post("/register", register);
router.post("/login", login);

// Profile Image
router.patch("/profile-image/:userId", addProfileImage);
router.get("/profile-image/:userId", getProfileImageByUserId);

// Customar address
router.post("/add-address/:userId", addAddress);
router.get("/addresses/:userId", getAllAddresses);
router.delete("/addresses/:userId/:addressId", deleteAddress);

// Products
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post(
  "/products/create",
  protect,
  authorize("admin", "superadmin"),
  createProduct,
);
router.put(
  "/products/edit/:id",
  protect,
  authorize("admin", "superadmin"),
  editProduct,
);
router.delete(
  "/products/delete/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteProduct,
);

// Payment
router.post("/payment/order", createOrder);
router.post("/payment/verify", verifyPayment);

// Cart
router.get("/cart/:userId", getCart);
router.post("/cart/add", addToCart);
router.delete("/cart/remove", removeFromCart);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:userId", getOrderByUserId);
router.patch(
  "/orders/status/:orderId",
  protect,
  authorize("admin", "superadmin"),
  updateOrderStatus,
);

// ADMIN PANEL

// Admin Auth
router.post("/admin/register", protect, authorize("superadmin"), adminregister);
router.post("/admin/login", adminlogin);


// Total Revenue
router.get("/admin/total-revenue", totalRevenue);

// Total Customers Count
router.get("/admin/total-customers", customerCount);

// Total Orders Count
router.get("/admin/total-orders", orderCount);

// Total Products Count
router.get("/admin/total-products", totalProducts);

// Users
router.get("/admin/users", getAllUserWithDetails);

// Payments
router.get("/admin/payments", getAllPayments);
router.get("/admin/download-invoice/:id", downloadInvoice);

// Admin Panel Count
router.get("/admin/admin-count", adminCount);
router.get("/admin/manager-count", managerCount);
router.get("/admin/support-count", supportCount);
router.get("/admin/super-admin-count", superAdminCount);

// Report & Analytics

// Users Report
router.get("/admin/reports/users", usersReport);
router.get(
  "/admin/reports/users/download",
  protect,
  authorize("superadmin", "admin"),
  downloadUserRoleReportPDF,
);

// Products Report
router.get("/admin/reports/products", productsReport);
router.get(
  "/admin/reports/products/download",
  protect,
  authorize("superadmin", "admin"),
  downloadProductStockReportPDF,
);

// Admin Roles Report
router.get("/admin/reports/admin-roles", adminRoleReport);
router.get(
  "/admin/reports/admin-roles/download",
  protect,
  authorize("superadmin", "admin"),
  downloadAdminRoleReportPDF,
);

// Sales Report
router.get("/admin/reports/sales", salesReport);
router.get(
  "/admin/reports/sales/download",
  protect,
  authorize("superadmin", "admin"),
  downloadSalesReportPDF,
);

// Notifications
router.get(
  "/admin/notifications",
  protect,
  authorize("superadmin", "admin"),
  getNotifications,
);
router.get("/admin/notifications/total", totalNotifications);
router.get("/admin/notifications/unread", totalUnreadNotifications);
router.get("/admin/notifications/read", totalReadNotifications);
router.put("/admin/notifications/read/:id", readNotification);

// Top Categories
router.get("/admin/top-categories", getTopCategories);

// Recent Orders
router.get("/admin/recent-orders", getRecentOrders);

// Orders Chart
router.get("/admin/orders-chart", getOrdersChart);

// Revenue Chart
router.get("/admin/revenue-chart", getRevenueChart);

// Tickets
router.post("/tickets", createTicket);
router.get("/tickets", getTickets);
router.patch(
  "/tickets/:id/status",
  protect,
  authorize("admin", "superadmin"),
  updateTicketStatus,
);
router.delete(
  "/tickets/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteTicket,
);
router.get("/tickets/email/:email", getTicketByEmail);


// Export Dashboard Data as PDF
router.get(
  "/admin/dashboard/export",
  protect,
  authorize("superadmin", "admin"),
  exportDashboardPDF,
);