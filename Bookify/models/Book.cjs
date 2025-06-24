const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  publishedYear: { type: Number },
  availableCopies: { type: Number, required: true, default: 1 },
  totalCopies: { type: Number, required: true },
  imageUrl: { type: String } 
});
module.exports = mongoose.model("Book", bookSchema);
