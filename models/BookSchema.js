const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true,
  },
  writer: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const books = mongoose.model('books', BookSchema)

module.exports = books
