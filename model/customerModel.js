import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
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

// Update the updatedAt field on save
customerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // next();
});

// Virtual for getting customer's orders
customerSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "customer",
});

// Enable virtuals in JSON output
customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;