import Order from "../model/orderModel.js";
import Customer from "../model/customerModel.js";
import Book from "../model/bookModel.js";

export async function createOrder(req, res) {
  try {
    const { customerId, books, shippingAddress, notes } = req.body;

    if (!customerId || !books || books.length === 0) {
      return res.status(400).json({
        message: "Missing required fields: customerId, books",
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const orderBooks = [];
    for (const bookData of books) {
      const book = await Book.findById(bookData.bookId);
      if (!book) {
        return res.status(404).json({
          message: `Book not found: ${bookData.bookId}`,
        });
      }

      if (book.stockQuantity < bookData.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for book: ${book.title}`,
          book: book.title,
          available: book.stockQuantity,
          requested: bookData.quantity,
        });
      }

      orderBooks.push({
        book: bookData.bookId,
        quantity: bookData.quantity,
        priceAtTime: book.price,
      });

      book.stockQuantity -= bookData.quantity;
      await book.save();
    }

    const order = await Order.create({
      customer: customerId,
      books: orderBooks,
      shippingAddress: shippingAddress || customer.address,
      notes,
      status: "pending",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("books.book", "title author price");

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (customerId) query.customer = customerId;

    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .populate("books.book", "title author")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("customer", "name email phone address")
      .populate("books.book", "title author price genre");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email")
      .populate("books.book", "title");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}