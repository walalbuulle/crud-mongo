import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Customer reference is required"],
  },
  books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
      },
      priceAtTime: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
      },
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, "Total amount cannot be negative"],
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // Calculate total amount
  if (this.books && this.books.length > 0) {
    this.totalAmount = this.books.reduce(
      (total, book) => total + book.priceAtTime * book.quantity,
      0
    );
  } else {
    this.totalAmount = 0;
  }
  
  // next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;