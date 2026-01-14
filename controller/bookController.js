import Book from "../model/bookModel.js";

export async function createBook(req, res) {
  try {
    const { title, author, isbn, genre, price, stockQuantity, publishedYear, description } = req.body;

    if (!title || !author || !isbn || !genre || !price) {
      return res.status(400).json({
        message: "Missing required fields: title, author, isbn, genre, price",
      });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({ message: "Book with this ISBN already exists" });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      price,
      stockQuantity: stockQuantity || 0,
      publishedYear,
      description,
    });

    return res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllBooks(req, res) {
  try {
    const { page = 1, limit = 10, search = "", genre, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }
    
    if (genre) {
      query.genre = genre;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const books = await Book.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    return res.status(200).json({
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    return res.status(200).json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await Book.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}