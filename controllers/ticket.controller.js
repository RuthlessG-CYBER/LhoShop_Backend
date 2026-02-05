import Ticket from "../models/ticket.model.js";


/* ================= CREATE ================= */
export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      message,
      customerName,
      customerEmail,
      priority,
    } = req.body;

    if (!subject || !customerName || !customerEmail) {
      return res.status(400).json({
        message: "Subject, name and email are required",
      });
    }

    const ticket = await Ticket.create({
      ticketId: `TK-${Date.now().toString().slice(-6)}`,
      subject,
      message,
      customerName,
      customerEmail,
      priority: priority || "Medium",
      status: "Open",
      sla: "—",
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create ticket",
    });
  }
};



/* ================= GET ALL (with search) ================= */
export const getTickets = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { ticketId: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    res.json({
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE STATUS ================= */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status, priority },
      { new: true }
    );

    res.json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= DELETE ================= */
export const deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getTicketByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const tickets = await Ticket.find({ customerEmail: email })
      .sort({ createdAt: -1 });

    res.json({ 
        message: "Tickets fetched successfully",
        tickets
     });

  } catch (err) {
    console.log("Error fetching tickets by email:", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};
