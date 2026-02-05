import Customer from "../models/customer.model.js";
import Payments from "../models/payment.model.js";
import Products from "../models/product.model.js";
import Admin from "../models/admin.model.js";
import Ticket from "../models/ticket.model.js";
import PDFDocument from "pdfkit";



// Total Revenue
export const totalRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const total = await Payments.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfThisMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const thisMonth = await Payments.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfThisMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const lastMonth = await Payments.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let percentage = 0;

    if (lastMonth.length > 0) {
      percentage =
        ((thisMonth[0].total - lastMonth[0].total) / lastMonth[0].total) * 100;
    }

    res.json({
      total: total.length > 0 ? total[0].total : 0,
      thisMonth: thisMonth.length > 0 ? thisMonth[0].total : 0,
      lastMonth: lastMonth.length > 0 ? lastMonth[0].total : 0,
      percentage: percentage.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer Count
export const customerCount = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const total = await Customer.countDocuments();

    const thisMonth = await Customer.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const lastMonth = await Customer.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    let percentage = 0;

    if (lastMonth > 0) {
      percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
    }

    res.json({
      total,
      thisMonth,
      lastMonth,
      percentage: percentage.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Count
export const orderCount = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const total = await Payments.countDocuments();

    const thisMonth = await Payments.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const lastMonth = await Payments.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    let percentage = 0;

    if (lastMonth > 0) {
      percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
    }

    res.json({
      total,
      thisMonth,
      lastMonth,
      percentage: percentage.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Total Products
export const totalProducts = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const total = await Products.countDocuments();

    const thisMonth = await Products.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const lastMonth = await Products.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    let percentage = 0;

    if (lastMonth > 0) {
      percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
    }

    res.json({
      total,
      thisMonth,
      lastMonth,
      percentage: percentage.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Users
export const getAllUserWithDetails = async (req, res) => {
    try {
        const users = await Customer.find();
        res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
}

// Payments with Invoice
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payments.find();
        res.status(200).json({
            message: "Payments fetched successfully",
            payments
        });
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
}


export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payments.findById(id).populate('userId', 'name email phone').populate('items.productId', 'name');
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${payment.orderId}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    drawRoundedRect(0, 0, 595, 140, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 40);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('E-Commerce Solutions', 50, 85)
       .text('support@lhoshop.com', 50, 100)
       .text('+91 1800-XXX-XXXX', 50, 115);

    doc.fillColor('#FFFFFF')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50, { width: 145, align: 'right' });

    doc.fillColor('#E5E5E5')
       .fontSize(11)
       .font('Helvetica')
       .text(`#${payment.orderId || 'N/A'}`, 400, 85, { width: 145, align: 'right' });

    let currentY = 170;

    drawRoundedRect(50, currentY, 245, 90, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, 245, 90, 8).stroke();

    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('BILL TO:', 65, currentY + 15);

    doc.fillColor(primaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(payment.userId?.name || 'Customer Name', 65, currentY + 30);

    doc.fillColor(primaryColor)
       .fontSize(9)
       .font('Helvetica')
       .text(payment.userId?.email || 'N/A', 65, currentY + 45, { width: 215 });

    if (payment.userId?.phone) {
      doc.text(payment.userId.phone, 65, currentY + 60);
    }

    drawRoundedRect(310, currentY, 235, 90, 8, lightBg);

    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Invoice Date:', 325, currentY + 15);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(
         new Date(payment.createdAt).toLocaleDateString('en-IN', {
           day: '2-digit',
           month: 'short',
           year: 'numeric'
         }),
         440,
         currentY + 15,
         { width: 90, align: 'right' }
       );

    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Payment ID:', 325, currentY + 35);

    doc.fillColor(primaryColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(payment.paymentId || 'N/A', 440, currentY + 35, { width: 90, align: 'right' });

    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Payment Status:', 325, currentY + 55);

    const statusColor = payment.status === 'Success' || payment.status === 'Completed' ? successColor : accentColor;
    doc.fillColor(statusColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(payment.status || 'N/A', 440, currentY + 55, { width: 90, align: 'right' });

    currentY += 110;

    if (payment.address) {
      drawRoundedRect(50, currentY, 495, 70, 8, '#FFFFFF');
      doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, 495, 70, 8).stroke();

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('DELIVERY ADDRESS:', 65, currentY + 15);

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(payment.address, 65, currentY + 30, { width: 465, lineGap: 2 });

      currentY += 85;
    }

    doc.fillColor(primaryColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Order Items', 50, currentY);

    doc.moveTo(50, currentY + 22)
       .lineTo(545, currentY + 22)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 32;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('#', 60, currentY + 8, { width: 25 })
       .text('Product', 95, currentY + 8, { width: 220 })
       .text('Quantity', 325, currentY + 8, { width: 70, align: 'center' })
       .text('Price', 405, currentY + 8, { width: 70, align: 'right' })
       .text('Total', 485, currentY + 8, { width: 50, align: 'right' });

    currentY += 30;

    let subtotal = 0;

    payment.items.forEach((item, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 24, 2, '#FAFAFA');
      }

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text((index + 1).toString(), 60, currentY + 4, { width: 25 });

      const productName = item.productId?.name || `Product ${item.productId}`;
      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(
           productName.substring(0, 35) + (productName.length > 35 ? '...' : ''),
           95,
           currentY + 4,
           { width: 220 }
         );

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text((item.quantity || 1).toString(), 325, currentY + 4, { width: 70, align: 'center' });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 405, currentY + 4, { width: 70, align: 'right' });

      const itemTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += itemTotal;

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(`₹${itemTotal.toLocaleString('en-IN')}`, 485, currentY + 4, { width: 50, align: 'right' });

      currentY += 24;
    });

    currentY += 15;

    doc.moveTo(50, currentY)
       .lineTo(545, currentY)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 15;

    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Subtotal:', 405, currentY, { width: 70, align: 'right' });

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`₹${subtotal.toLocaleString('en-IN')}`, 485, currentY, { width: 50, align: 'right' });

    currentY += 20;

    const tax = subtotal * 0.18;
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Tax (18%):', 405, currentY, { width: 70, align: 'right' });

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`₹${Math.round(tax).toLocaleString('en-IN')}`, 485, currentY, { width: 50, align: 'right' });

    currentY += 20;

    drawRoundedRect(380, currentY - 5, 165, 30, 6, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Total Amount:', 390, currentY + 3);

    doc.fillColor(primaryColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, 485, currentY + 2, { width: 50, align: 'right' });

    currentY += 50;

    if (payment.delivaryStatus) {
      drawRoundedRect(50, currentY, 495, 35, 6, '#FFFFFF');
      doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, 495, 35, 6).stroke();

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text('Delivery Status:', 65, currentY + 12);

      const deliveryColor = payment.delivaryStatus === 'Delivered' ? successColor : 
                           payment.delivaryStatus === 'Pending' ? '#F59E0B' : accentColor;

      doc.fillColor(deliveryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(payment.delivaryStatus, 160, currentY + 11);
    }

    doc.moveTo(50, 770)
       .lineTo(545, 770)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    doc.fillColor(accentColor)
       .fontSize(8)
       .font('Helvetica')
       .text('Thank you for shopping with LhoShop!', 50, 780, { align: 'center', width: 495 });

    doc.fillColor(accentColor)
       .fontSize(7)
       .font('Helvetica')
       .text('This is a computer-generated invoice and does not require a signature.', 50, 792, { align: 'center', width: 495 });

    doc.end();

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
};



// Super Admin Count
export const superAdminCount = async (req, res) => {
  try {
    const admin = await Admin.countDocuments({ role: "superadmin" });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Count
export const adminCount = async (req, res) => {
  try {
    const admin = await Admin.countDocuments({ role: "admin" });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager Count
export const managerCount = async (req, res) => {
  try {
    const admin = await Admin.countDocuments({ role: "manager" });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Support Count
export const supportCount = async (req, res) => {
  try {
    const admin = await Admin.countDocuments({ role: "support" });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Reports and Analytics

export const salesReport = async (req, res) => {
  try {
    const totalRevenue = await Payments.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalOrders = await Payments.countDocuments()

    const successOrders = await Payments.countDocuments({
      status: "success",
    })

    const processingOrders = await Payments.countDocuments({
      delivaryStatus: "Processing",
    })

    res.json({
      revenue: totalRevenue[0]?.total || 0,
      totalOrders,
      successOrders,
      processingOrders,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const usersReport = async (req, res) => {
  try {
    const total = await Customer.countDocuments()

    const activeThisMonth = await Customer.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    })

    res.json({
      totalUsers: total,
      newUsersThisMonth: activeThisMonth,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


export const productsReport = async (req, res) => {
  try {
    const total = await Products.countDocuments()

    const lowStock = await Products.countDocuments({
      stock: { $lte: 5, $gt: 0 },
    })

    const outStock = await Products.countDocuments({
      stock: 0,
    })

    res.json({
      totalProducts: total,
      lowStock,
      outStock,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const adminRoleReport = async (req, res) => {
  try {
    const superadmin = await Admin.countDocuments({ role: "superadmin" })
    const admin = await Admin.countDocuments({ role: "admin" })
    const manager = await Admin.countDocuments({ role: "manager" })
    const support = await Admin.countDocuments({ role: "support" })

    res.json({
      superadmin,
      admin,
      manager,
      support,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


export const downloadSalesReportPDF = async (req, res) => {
  try {
    const payments = await Payments.find();

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOrders = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'Success' || p.status === 'Completed').length;
    const pendingPayments = payments.filter(p => p.status === 'Pending').length;
    const failedPayments = payments.filter(p => p.status === 'Failed').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveredOrders = payments.filter(p => p.delivaryStatus === 'Delivered').length;
    const pendingOrders = payments.filter(p => p.delivaryStatus === 'Pending' || p.delivaryStatus === 'Processing').length;

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-report-${new Date().toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';
    const warningColor = '#F59E0B';
    const dangerColor = '#EF4444';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    drawRoundedRect(0, 0, 595, 120, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 35);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('Sales & Revenue Report', 50, 75);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .text(`Generated on ${reportDate}`, 400, 75, { width: 145, align: 'right' });

    let currentY = 150;

    const cardWidth = 155;
    const cardHeight = 90;
    const cardGap = 20;

    drawRoundedRect(50, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Total Revenue', 60, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`₹${totalRevenue.toLocaleString('en-IN')}`, 60, currentY + 35);
    
    doc.fillColor(successColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`${totalOrders} orders`, 60, currentY + 65);

    drawRoundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Avg Order Value', 60 + cardWidth + cardGap, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`₹${Math.round(averageOrderValue).toLocaleString('en-IN')}`, 60 + cardWidth + cardGap, currentY + 35);
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('per transaction', 60 + cardWidth + cardGap, currentY + 65);

    drawRoundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Order Status', 60 + (cardWidth + cardGap) * 2, currentY + 15);
    
    doc.fillColor(successColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`✓ ${deliveredOrders} Delivered`, 60 + (cardWidth + cardGap) * 2, currentY + 38);
    
    doc.fillColor(warningColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`⏱ ${pendingOrders} Pending`, 60 + (cardWidth + cardGap) * 2, currentY + 52);

    currentY += cardHeight + 30;

    drawRoundedRect(50, currentY, 235, 60, 8, lightBg);
    
    doc.fillColor(primaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Payment Status Breakdown', 60, currentY + 12);
    
    doc.fillColor(successColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`✓ Successful: ${successfulPayments}`, 60, currentY + 30);
    
    doc.fillColor(warningColor)
       .fontSize(9)
       .text(`⏱ Pending: ${pendingPayments}`, 155, currentY + 30);
    
    doc.fillColor(dangerColor)
       .fontSize(9)
       .text(`✗ Failed: ${failedPayments}`, 60, currentY + 44);

    drawRoundedRect(310, currentY, 235, 60, 8, lightBg);
    
    doc.fillColor(primaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Quick Stats', 320, currentY + 12);
    
    const successRate = totalOrders > 0 ? ((successfulPayments / totalOrders) * 100).toFixed(1) : 0;
    
    doc.fillColor(primaryColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`Success Rate: ${successRate}%`, 320, currentY + 30);
    
    doc.fillColor(primaryColor)
       .fontSize(9)
       .text(`Total Transactions: ${totalOrders}`, 320, currentY + 44);

    currentY += 80;

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Transaction History', 50, currentY);
    
    doc.moveTo(50, currentY + 25)
       .lineTo(545, currentY + 25)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('#', 60, currentY + 8, { width: 25 })
       .text('Order ID', 95, currentY + 8, { width: 110 })
       .text('Amount', 215, currentY + 8, { width: 80 })
       .text('Payment', 305, currentY + 8, { width: 80 })
       .text('Delivery', 395, currentY + 8, { width: 70 })
       .text('Date', 475, currentY + 8, { width: 60 });

    currentY += 30;

    payments.forEach((payment, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 24, 2, '#FAFAFA');
      }

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text((index + 1).toString(), 60, currentY + 4, { width: 25 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(payment.orderId || 'N/A', 95, currentY + 4, { width: 110 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, 215, currentY + 4, { width: 80 });

      let paymentStatusColor, paymentStatusBg, paymentStatusText;
      const paymentStatus = payment.status || 'Unknown';
      if (paymentStatus === 'Success' || paymentStatus === 'Completed') {
        paymentStatusColor = successColor;
        paymentStatusBg = '#D1FAE5';
        paymentStatusText = 'Success';
      } else if (paymentStatus === 'Pending') {
        paymentStatusColor = warningColor;
        paymentStatusBg = '#FEF3C7';
        paymentStatusText = 'Pending';
      } else if (paymentStatus === 'Failed') {
        paymentStatusColor = dangerColor;
        paymentStatusBg = '#FEE2E2';
        paymentStatusText = 'Failed';
      } else {
        paymentStatusColor = accentColor;
        paymentStatusBg = '#F3F4F6';
        paymentStatusText = paymentStatus.substring(0, 7);
      }

      drawRoundedRect(305, currentY + 2, 75, 18, 4, paymentStatusBg);
      doc.fillColor(paymentStatusColor)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(paymentStatusText, 305, currentY + 6, { width: 75, align: 'center' });

      const deliveryStatus = payment.delivaryStatus || 'N/A';
      let deliveryColor = accentColor;
      if (deliveryStatus === 'Delivered') deliveryColor = successColor;
      else if (deliveryStatus === 'Pending' || deliveryStatus === 'Processing') deliveryColor = warningColor;

      doc.fillColor(deliveryColor)
         .fontSize(8)
         .font('Helvetica')
         .text(deliveryStatus.substring(0, 8), 395, currentY + 5, { width: 70 });

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A',
           475,
           currentY + 5,
           { width: 60 }
         );

      currentY += 24;

      if (currentY > 720 && index < payments.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           'LhoShop Sales Report - Confidential',
           50,
           780,
           { width: 250, align: 'left' }
         );

      doc.text(
        `Page ${i + 1} of ${range.count}`,
        0,
        780,
        { width: 545, align: 'right' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};


export const downloadUserRoleReportPDF = async (req, res) => {
  try {
    const users = await Customer.find();

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const verifiedUsers = users.filter(u => u.isVerified === true).length;
    const newUsersThisMonth = users.filter(u => {
      const userDate = new Date(u.createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length;

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user-report-${new Date().toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';
    const infoColor = '#3B82F6';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    drawRoundedRect(0, 0, 595, 120, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 35);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('User Report', 50, 75);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .text(`Generated on ${reportDate}`, 400, 75, { width: 145, align: 'right' });

    let currentY = 150;

    const cardWidth = 118;
    const cardHeight = 90;
    const cardGap = 15;

    drawRoundedRect(50, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Total Users', 58, currentY + 12);
    
    doc.fillColor(primaryColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(totalUsers.toString(), 58, currentY + 32);
    
    doc.fillColor(accentColor)
       .fontSize(8)
       .font('Helvetica')
       .text('registered', 58, currentY + 62);

    drawRoundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Active Users', 58 + cardWidth + cardGap, currentY + 12);
    
    doc.fillColor(successColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(activeUsers.toString(), 58 + cardWidth + cardGap, currentY + 32);
    
    doc.fillColor(successColor)
       .fontSize(8)
       .font('Helvetica')
       .text('engaged', 58 + cardWidth + cardGap, currentY + 62);

    drawRoundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Verified', 58 + (cardWidth + cardGap) * 2, currentY + 12);
    
    doc.fillColor(infoColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(verifiedUsers.toString(), 58 + (cardWidth + cardGap) * 2, currentY + 32);
    
    doc.fillColor(infoColor)
       .fontSize(8)
       .font('Helvetica')
       .text('confirmed', 58 + (cardWidth + cardGap) * 2, currentY + 62);

    drawRoundedRect(50 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('New This Month', 58 + (cardWidth + cardGap) * 3, currentY + 12);
    
    doc.fillColor(primaryColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(newUsersThisMonth.toString(), 58 + (cardWidth + cardGap) * 3, currentY + 32);
    
    doc.fillColor(accentColor)
       .fontSize(8)
       .font('Helvetica')
       .text('joined', 58 + (cardWidth + cardGap) * 3, currentY + 62);

    currentY += cardHeight + 40;

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Customer Directory', 50, currentY);
    
    doc.moveTo(50, currentY + 25)
       .lineTo(545, currentY + 25)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('#', 60, currentY + 8, { width: 25 })
       .text('Name', 95, currentY + 8, { width: 130 })
       .text('Email', 235, currentY + 8, { width: 160 })
       .text('Joined', 405, currentY + 8, { width: 70 })
       .text('Status', 485, currentY + 8, { width: 50, align: 'center' });

    currentY += 30;

    users.forEach((user, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 24, 2, '#FAFAFA');
      }

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text((index + 1).toString(), 60, currentY + 4, { width: 25 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(
           (user.name || 'N/A').substring(0, 20) + ((user.name?.length > 20) ? '...' : ''),
           95,
           currentY + 4,
           { width: 130 }
         );

      doc.fillColor(primaryColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           (user.email || 'N/A').substring(0, 25) + ((user.email?.length > 25) ? '...' : ''),
           235,
           currentY + 5,
           { width: 160 }
         );

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A',
           405,
           currentY + 5,
           { width: 70 }
         );

      const isActive = user.isActive !== false;
      const statusColor = isActive ? successColor : accentColor;
      const statusBg = isActive ? '#D1FAE5' : '#F3F4F6';
      const statusText = isActive ? '✓' : '○';

      drawRoundedRect(495, currentY + 3, 30, 16, 8, statusBg);
      
      doc.fillColor(statusColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(statusText, 495, currentY + 5, { width: 30, align: 'center' });

      currentY += 24;

      if (currentY > 720 && index < users.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           'LhoShop User Report - Confidential',
           50,
           780,
           { width: 250, align: 'left' }
         );

      doc.text(
        `Page ${i + 1} of ${range.count}`,
        0,
        780,
        { width: 545, align: 'right' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};


export const downloadProductStockReportPDF = async (req, res) => {
  try {
    const products = await Products.find();

    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=product-stock-report-${new Date().toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';
    const warningColor = '#F59E0B';
    const dangerColor = '#EF4444';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    drawRoundedRect(0, 0, 595, 120, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 35);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('Product Stock Report', 50, 75);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .text(`Generated on ${reportDate}`, 400, 75, { width: 145, align: 'right' });

    let currentY = 150;

    const cardWidth = 118;
    const cardHeight = 90;
    const cardGap = 15;

    drawRoundedRect(50, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Total Products', 58, currentY + 12);
    
    doc.fillColor(primaryColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(totalProducts.toString(), 58, currentY + 32);
    
    doc.fillColor(accentColor)
       .fontSize(8)
       .font('Helvetica')
       .text('in catalog', 58, currentY + 62);

    drawRoundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('In Stock', 58 + cardWidth + cardGap, currentY + 12);
    
    doc.fillColor(successColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(inStockProducts.toString(), 58 + cardWidth + cardGap, currentY + 32);
    
    doc.fillColor(successColor)
       .fontSize(8)
       .font('Helvetica')
       .text('available', 58 + cardWidth + cardGap, currentY + 62);

    drawRoundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Low Stock', 58 + (cardWidth + cardGap) * 2, currentY + 12);
    
    doc.fillColor(warningColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(lowStockProducts.toString(), 58 + (cardWidth + cardGap) * 2, currentY + 32);
    
    doc.fillColor(warningColor)
       .fontSize(8)
       .font('Helvetica')
       .text('< 10 units', 58 + (cardWidth + cardGap) * 2, currentY + 62);

    drawRoundedRect(50 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Out of Stock', 58 + (cardWidth + cardGap) * 3, currentY + 12);
    
    doc.fillColor(dangerColor)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(outOfStockProducts.toString(), 58 + (cardWidth + cardGap) * 3, currentY + 32);
    
    doc.fillColor(dangerColor)
       .fontSize(8)
       .font('Helvetica')
       .text('need restock', 58 + (cardWidth + cardGap) * 3, currentY + 62);

    currentY += cardHeight + 40;

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Product Inventory', 50, currentY);
    
    doc.moveTo(50, currentY + 25)
       .lineTo(545, currentY + 25)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('#', 60, currentY + 8, { width: 25 })
       .text('Product Name', 95, currentY + 8, { width: 200 })
       .text('Category', 305, currentY + 8, { width: 90 })
       .text('Stock', 405, currentY + 8, { width: 60, align: 'center' })
       .text('Status', 475, currentY + 8, { width: 60, align: 'center' });

    currentY += 30;

    products.forEach((product, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 24, 2, '#FAFAFA');
      }

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text((index + 1).toString(), 60, currentY + 4, { width: 25 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(
           (product.name || 'N/A').substring(0, 32) + ((product.name?.length > 32) ? '...' : ''),
           95,
           currentY + 4,
           { width: 200 }
         );

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(product.category || 'N/A', 305, currentY + 4, { width: 90 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text((product.stock || 0).toString(), 405, currentY + 4, { width: 60, align: 'center' });

      let statusColor, statusBg, statusText;
      if (product.stock === 0) {
        statusColor = dangerColor;
        statusBg = '#FEE2E2';
        statusText = 'Out';
      } else if (product.stock < 10) {
        statusColor = warningColor;
        statusBg = '#FEF3C7';
        statusText = 'Low';
      } else {
        statusColor = successColor;
        statusBg = '#D1FAE5';
        statusText = 'Good';
      }

      drawRoundedRect(475, currentY + 2, 60, 18, 4, statusBg);
      
      doc.fillColor(statusColor)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(statusText, 475, currentY + 6, { width: 60, align: 'center' });

      currentY += 24;

      if (currentY > 720 && index < products.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           'LhoShop Stock Report - Confidential',
           50,
           780,
           { width: 250, align: 'left' }
         );

      doc.text(
        `Page ${i + 1} of ${range.count}`,
        0,
        780,
        { width: 545, align: 'right' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};


export const downloadAdminRoleReportPDF = async (req, res) => {
  try {
    const admins = await Admin.find();

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=admin-role-report-${new Date().toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    drawRoundedRect(0, 0, 595, 120, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 35);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('Admin Role Report', 50, 75);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .text(`Generated on ${reportDate}`, 400, 75, { width: 145, align: 'right' });

    let currentY = 150;

    const roleCount = admins.reduce((acc, admin) => {
      acc[admin.role] = (acc[admin.role] || 0) + 1;
      return acc;
    }, {});

    const cardWidth = 155;
    const cardHeight = 90;
    const cardGap = 20;

    drawRoundedRect(50, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Total Admins', 60, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(admins.length.toString(), 60, currentY + 35);
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('registered', 60, currentY + 65);

    drawRoundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Super Admins', 60 + cardWidth + cardGap, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text((roleCount['superadmin'] || 0).toString(), 60 + cardWidth + cardGap, currentY + 35);
    
    doc.fillColor(successColor)
       .fontSize(9)
       .font('Helvetica')
       .text('full access', 60 + cardWidth + cardGap, currentY + 65);

    drawRoundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Regular Admins', 60 + (cardWidth + cardGap) * 2, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text((roleCount['admin'] || 0).toString(), 60 + (cardWidth + cardGap) * 2, currentY + 35);
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('limited access', 60 + (cardWidth + cardGap) * 2, currentY + 65);

    currentY += cardHeight + 40;

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Administrator Details', 50, currentY);
    
    doc.moveTo(50, currentY + 25)
       .lineTo(545, currentY + 25)
       .strokeColor('#E5E5E5')
       .lineWidth(1)
       .stroke();

    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('#', 60, currentY + 8, { width: 30 })
       .text('Name', 100, currentY + 8, { width: 120 })
       .text('Email', 230, currentY + 8, { width: 180 })
       .text('Role', 420, currentY + 8, { width: 115, align: 'right' });

    currentY += 30;

    admins.forEach((admin, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 24, 2, '#FAFAFA');
      }

      doc.fillColor(accentColor)
         .fontSize(9)
         .font('Helvetica')
         .text((index + 1).toString(), 60, currentY + 4, { width: 30 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(admin.name || 'N/A', 100, currentY + 4, { width: 120 });

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(admin.email || 'N/A', 230, currentY + 4, { width: 180 });

      const roleColor = admin.role === 'superadmin' ? successColor : accentColor;
      const roleText = admin.role === 'superadmin' ? 'Super Admin' : 
                       admin.role === 'admin' ? 'Admin' : admin.role;

      drawRoundedRect(420, currentY + 2, 115, 18, 4, roleColor === successColor ? '#D1FAE5' : '#F3F4F6');
      
      doc.fillColor(roleColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(roleText, 420, currentY + 6, { width: 115, align: 'center' });

      currentY += 24;

      if (currentY > 720 && index < admins.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           'LhoShop Admin Report - Confidential',
           50,
           780,
           { width: 250, align: 'left' }
         );

      doc.text(
        `Page ${i + 1} of ${range.count}`,
        0,
        780,
        { width: 545, align: 'right' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Top Categories
export const getTopCategories = async (req, res) => {
  try {
    const totalProducts = await Products.countDocuments()

    if (totalProducts === 0) {
      return res.json({
        total: 0,
        categories: [],
      })
    }

    const grouped = await Products.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    const categories = grouped.map((item) => ({
      name: item._id,
      value: Math.round((item.count / totalProducts) * 100),
    }))

    res.json({
      total: totalProducts,
      categories,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" })
  }
}


// Recent Orders
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Payments.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("userId", "name email")

    const formatted = orders.map((o) => ({
      id: o.orderId,
      customer: o.userId?.name || "Unknown",
      email: o.userId?.email || "N/A",
      amount: `₹${o.amount}`,
      status: o.delivaryStatus,
    }))

    res.json({
      message: "Recent orders fetched successfully",
      orders: formatted,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


// Order Chart
export const getOrdersChart = async (req, res) => {
  try {
    const days = 7

    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)

    const orders = await Payments.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          status: "success",
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$createdAt",
          },
          count: { $sum: 1 },
        },
      },
    ])

    const weekMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    }

    const result = []

    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))

      const mongoDay = d.getDay() + 1

      const found = orders.find((o) => o._id === mongoDay)

      result.push({
        day: weekMap[mongoDay],
        orders: found ? found.count : 0,
      })
    }

    res.json({
      message: "Orders chart fetched",
      data: result,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Revenue Chart
export const getRevenueChart = async (req, res) => {
  try {
    const result = await Payments.aggregate([
      {
        $match: {
          status: "success",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const fullData = months.map((month, index) => {
      const found = result.find(r => r._id === index + 1);
      return {
        month,
        revenue: found ? found.revenue : 0,
      };
    });

    res.json({
      data: fullData,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch revenue chart" });
  }
};


export const exportDashboardPDF = async (req, res) => {
  try {
    const orders = await Payments.find().lean();
    const products = await Products.find().lean();
    const tickets = await Ticket.find().lean();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const completedOrders = orders.filter(o => o.delivaryStatus === 'Delivered').length;
    const pendingTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Pending').length;

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lhoshop-report-${new Date().toISOString().split('T')[0]}.pdf`
    );

    doc.pipe(res);

    const primaryColor = '#2F2F2F';
    const accentColor = '#8E8E8E';
    const lightBg = '#F6F4F1';
    const successColor = '#10B981';
    const warningColor = '#F59E0B';

    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.fillColor(fillColor)
         .roundedRect(x, y, width, height, radius)
         .fill();
    };

    const drawSectionHeader = (title, yPosition) => {
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(title, 50, yPosition);
      
      doc.moveTo(50, yPosition + 25)
         .lineTo(545, yPosition + 25)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();
    };

    drawRoundedRect(0, 0, 595, 120, 0, primaryColor);

    doc.fillColor('#FFFFFF')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LhoShop', 50, 35);

    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .font('Helvetica')
       .text('E-Commerce Dashboard Report', 50, 75);

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#E5E5E5')
       .fontSize(10)
       .text(`Generated on ${reportDate}`, 400, 75, { width: 145, align: 'right' });

    doc.moveDown(4);

    let currentY = 150;

    const cardWidth = 155;
    const cardHeight = 90;
    const cardGap = 20;

    drawRoundedRect(50, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Total Revenue', 60, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(`₹${totalRevenue.toLocaleString('en-IN')}`, 60, currentY + 35);
    
    doc.fillColor(successColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`${orders.length} orders`, 60, currentY + 65);

    drawRoundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + cardWidth + cardGap, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Total Products', 60 + cardWidth + cardGap, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(products.length.toString(), 60 + cardWidth + cardGap, currentY + 35);
    
    doc.fillColor(accentColor)
       .fontSize(9)
       .font('Helvetica')
       .text('in catalog', 60 + cardWidth + cardGap, currentY + 65);

    drawRoundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8, '#FFFFFF');
    doc.strokeColor('#E5E5E5').lineWidth(1).roundedRect(50 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight, 8).stroke();
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Support Tickets', 60 + (cardWidth + cardGap) * 2, currentY + 15);
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(tickets.length.toString(), 60 + (cardWidth + cardGap) * 2, currentY + 35);
    
    doc.fillColor(warningColor)
       .fontSize(9)
       .font('Helvetica')
       .text(`${pendingTickets} pending`, 60 + (cardWidth + cardGap) * 2, currentY + 65);

    currentY += cardHeight + 40;

    drawSectionHeader('Recent Orders', currentY);
    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Order ID', 60, currentY + 8, { width: 120 })
       .text('Amount', 200, currentY + 8, { width: 100 })
       .text('Status', 320, currentY + 8, { width: 100 })
       .text('Date', 440, currentY + 8, { width: 95 });

    currentY += 30;

    const recentOrders = orders.slice(0, 10);
    recentOrders.forEach((order, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 22, 2, '#FAFAFA');
      }

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(order.orderId || 'N/A', 60, currentY + 3, { width: 120 })
         .text(`₹${(order.amount || 0).toLocaleString('en-IN')}`, 200, currentY + 3, { width: 100 });

      const statusColor = 
        order.delivaryStatus === 'Delivered' ? successColor :
        order.delivaryStatus === 'Pending' ? warningColor : accentColor;

      doc.fillColor(statusColor)
         .text(order.delivaryStatus || 'Unknown', 320, currentY + 3, { width: 100 });

      doc.fillColor(accentColor)
         .text(
           order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A',
           440,
           currentY + 3,
           { width: 95 }
         );

      currentY += 22;

      if (currentY > 720 && index < recentOrders.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    currentY += 30;

    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    drawSectionHeader('Recent Support Tickets', currentY);
    currentY += 40;

    drawRoundedRect(50, currentY, 495, 25, 4, lightBg);

    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Ticket ID', 60, currentY + 8, { width: 100 })
       .text('Subject', 180, currentY + 8, { width: 200 })
       .text('Status', 400, currentY + 8, { width: 80 })
       .text('Priority', 490, currentY + 8, { width: 55, align: 'right' });

    currentY += 30;

    const recentTickets = tickets.slice(0, 10);
    recentTickets.forEach((ticket, index) => {
      if (index % 2 === 0) {
        drawRoundedRect(50, currentY - 2, 495, 22, 2, '#FAFAFA');
      }

      doc.fillColor(primaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text(ticket.ticketId || 'N/A', 60, currentY + 3, { width: 100 })
         .text(
           (ticket.subject || 'No subject').substring(0, 35) + 
           ((ticket.subject?.length > 35) ? '...' : ''),
           180,
           currentY + 3,
           { width: 200 }
         );

      const ticketStatusColor = 
        ticket.status === 'Resolved' || ticket.status === 'Closed' ? successColor :
        ticket.status === 'Open' || ticket.status === 'Pending' ? warningColor : accentColor;

      doc.fillColor(ticketStatusColor)
         .text(ticket.status || 'Unknown', 400, currentY + 3, { width: 80 });

      doc.fillColor(accentColor)
         .text(ticket.priority || 'Normal', 490, currentY + 3, { width: 55, align: 'right' });

      currentY += 22;

      if (currentY > 720 && index < recentTickets.length - 1) {
        doc.addPage();
        currentY = 50;
      }
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .strokeColor('#E5E5E5')
         .lineWidth(1)
         .stroke();

      doc.fillColor(accentColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           'LhoShop Dashboard Report - Confidential',
           50,
           780,
           { width: 250, align: 'left' }
         );

      doc.text(
        `Page ${i + 1} of ${range.count}`,
        0,
        780,
        { width: 545, align: 'right' }
      );
    }

    doc.end();

  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).json({ message: err.message });
  }
};