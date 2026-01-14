import Customer from "../model/customerModel.js";
import Order from "../model/orderModel.js";

// Create a new customer
export async function createCustomer(req, res) {
  try {
    const { name, email, phone, address } = req.body;

    // Check required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Missing required fields: name, email, phone",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all customers
export async function getAllCustomers(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    return res.status(200).json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get customer by ID with orders
export async function getCustomerById(req, res) {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get customer's orders
    const orders = await Order.find({ customer: id })
      .populate("items.item", "name price")
      .sort({ orderDate: -1 });

    return res.status(200).json({
      customer,
      orders,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update customer
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow email update to avoid duplicates
    if (updateData.email) {
      delete updateData.email;
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Delete customer
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    // Check if customer has orders
    const orderCount = await Order.countDocuments({ customer: id });
    if (orderCount > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing orders",
        orderCount,
      });
    }

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get customer's orders
export async function getCustomerOrders(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { customer: id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("items.item", "name price category")
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
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}