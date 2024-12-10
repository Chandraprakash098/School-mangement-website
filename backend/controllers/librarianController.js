// controllers/librarianController.js
const Library = require('../models/Library');
const User = require('../models/User');

exports.addBook = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      isbn, 
      category, 
      class: bookClass, 
      totalCopies 
    } = req.body;

    const book = new Library({
      title,
      author,
      isbn,
      category,
      class: bookClass,
      totalCopies,
      availableCopies: totalCopies
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPendingBookRequests = async (req, res) => {
  try {
    const books = await Library.find({
      'issuedBooks': { 
        $elemMatch: { 
          status: 'pending' 
        } 
      }
    }).populate('issuedBooks.student');

    const pendingRequests = books.flatMap(book => 
      book.issuedBooks
        .filter(issue => issue.status === 'pending')
        .map(issue => ({
          bookTitle: book.title,
          bookId: book._id,
          issueId: issue._id,
          student: issue.student
        }))
    );

    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.approveBookIssue = async (req, res) => {
  try {
    const { bookId, issueId } = req.body;

    const book = await Library.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const issueIndex = book.issuedBooks.findIndex(
      issue => issue._id.toString() === issueId
    );

    if (issueIndex === -1) {
      return res.status(404).json({ message: 'Issue request not found' });
    }

    // Update book issue details
    book.issuedBooks[issueIndex].status = 'issued';
    book.issuedBooks[issueIndex].issuedDate = new Date();
    book.issuedBooks[issueIndex].expiryDate = new Date(
      Date.now() + 10 * 24 * 60 * 60 * 1000 // 10 days
    );
    book.availableCopies -= 1;

    await book.save();

    res.json({ message: 'Book issued successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { bookId, issueId } = req.body;

    const book = await Library.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const issueIndex = book.issuedBooks.findIndex(
      issue => issue._id.toString() === issueId
    );

    if (issueIndex === -1) {
      return res.status(404).json({ message: 'Issue request not found' });
    }

    const issue = book.issuedBooks[issueIndex];
    
    // Calculate fine if book is returned late
    const currentDate = new Date();
    const expiryDate = new Date(issue.expiryDate);
    let fineAmount = 0;

    if (currentDate > expiryDate) {
      const daysLate = Math.ceil(
        (currentDate - expiryDate) / (1000 * 60 * 60 * 24)
      );
      fineAmount = daysLate * 50; // 50 rupees per day
    }

    // Update book issue details
    book.issuedBooks[issueIndex].status = 'returned';
    book.issuedBooks[issueIndex].fineAmount = fineAmount;
    book.availableCopies += 1;

    await book.save();

    res.json({ 
      message: 'Book returned successfully', 
      book,
      fineAmount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};