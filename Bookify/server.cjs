const express = require("express");
const bcrypt = require("bcrypt");
require('dotenv').config();
const User = require("./models/User.cjs");
const Book = require("./models/Book.cjs");
const Loan = require("./models/Loan.cjs");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server sluša zahtjeve na portu ${PORT}`);
 });

const mongoose = require('mongoose');

let useDummyData = false;

const dummyBooks = [
  { _id: '1', title: 'Dummy Book 1', author: 'Autor 1', genre: 'Roman', publishedYear: 2020, availableCopies: 2, totalCopies: 2, imageUrl: '' },
  { _id: '2', title: 'Dummy Book 2', author: 'Autor 2', genre: 'Poezija', publishedYear: 2021, availableCopies: 1, totalCopies: 1, imageUrl: '' }
];
const dummyUsers = [
  { _id: '1', email: 'test@test.com', username: 'test', password: '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', role: 'user', rentedBooks: [] }, // password: test
  { _id: '2', email: 'admin@test.com', username: 'admin', password: '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', role: 'admin', rentedBooks: [] }
];
const dummyLoans = [];

mongoose.connect(process.env.ADRESA_BAZE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((err) => {
  console.error('Neuspela konekcija na bazu, prelazim na dummy mod:', err.message);
  useDummyData = true;
});

const db = mongoose.connection;
 

db.on('error', (error) => {
     console.error('Greška pri spajanju:', error);
 });
db.once('open', function() {
   console.log('Spojeni smo na MongoDB bazu');
 });

//SLIKE
 const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Folder "uploads" u rootu projekta
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Kreiraj jedinstveno ime datoteke: trenutni timestamp + originalno ime
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
//SLIKE
// Kreiraj instancu Multera
const upload = multer({ storage: storage });


// Konfiguriraj Express da servira statične datoteke iz foldera "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//SLIKE


app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('rentedBooks');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Greška pri dohvaćanju korisnika", details: error.message });
  }
});

app.get('/api/getbooks', async (req, res) => {
  try {
    const books = await Book.find();
    res.json({ books });
  } catch (error) {
    res.status(500).json({ error: "Greška pri dohvaćanju knjiga", details: error.message });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Loan.find().populate('user').populate('book');
    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ error: "Greška pri dohvaćanju rezervacija", details: error.message });
  }
});



app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username }).populate('rentedBooks');
    if (!user) {
      return res.status(400).json({ error: 'Korisnik nije pronađen' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Pogrešna lozinka' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
  
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        rentedBooks: user.rentedBooks
      }
    });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email već postoji!' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username već postoji!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    console.log('Novi korisnik:', newUser); 

    await newUser.save();

    console.log('Korisnik je spremljen u bazu!'); 

    res.status(201).json({ message: 'Korisnik uspješno registriran!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri registraciji korisnika' });
  }
});

// Admin middleware to verify JWT token and check admin role
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply admin middleware to admin routes
app.post('/api/books', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, author, genre, publishedYear, availableCopies, totalCopies } = req.body;
   
  
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

    const newBook = new Book({
      title,
      author,
      genre,
      publishedYear,
      availableCopies,
      totalCopies,
      imageUrl
    });

    await newBook.save();
    res.status(201).json({ message: "Knjiga uspješno dodana!", book: newBook });
  } catch (error) {
    res.status(500).json({ error: "❌ Greška pri dodavanju knjige", details: error.message });
  }
});

app.post("/api/loans", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    console.log("Attempting to rent book with id:", bookId);
    // Provjera postoji li već aktivna posudba
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      returnDate: null
    });
    if (existingLoan) {
      return res.status(400).json({ error: "Već ste posudili tu knjigu" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: "📚 Knjiga nije pronađena" });
    
    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: "📉 Nema dostupnih primjeraka za posudbu" });
    }
    
    const loan = new Loan({
      user: userId,
      book: bookId
    });
    await loan.save();
    
    // Smanji broj dostupnih primjeraka i ažuriraj korisnikov dokument (ako je potrebno)
    book.availableCopies -= 1;
    await book.save();
    await User.findByIdAndUpdate(userId, { $push: { rentedBooks: bookId } });

    res.status(201).json({
      message: "✅ Knjiga uspješno posuđena",
      loan
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Greška pri posudbi", details: err.message });
  }
});



app.put('/api/return/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Provjeri je li knjiga u korisnikovom popisu rezerviranih knjiga
    const bookIndex = user.rentedBooks.findIndex((rentedBookId) => rentedBookId.toString() === bookId);
    if (bookIndex === -1) {
      return res.status(400).json({ error: 'This book is not reserved by the user' });
    }
    const loanDeletionResult = await Loan.deleteOne({ user: userId, book: bookId });
    if (loanDeletionResult.deletedCount === 0) {
      return res.status(400).json({ error: 'Loan not found for given user and book' });
    }
    // Ukloni knjigu iz popisa rezerviranih knjiga
    user.rentedBooks.splice(bookIndex, 1);
    await user.save();

    // Pronađi knjigu i povećaj broj dostupnih primjeraka (ako postoji)
    const book = await Book.findById(bookId);
    if (!book) {
       //
    }

    book.availableCopies += 1;
    await book.save();

    res.json({ message: 'Book successfully returned', book });
  } catch (error) {
    console.error("Error in returning book:", error);
    res.status(500).json({ error: 'Internal error returning book' });
  }
});

app.put('/api/title/:title', adminMiddleware, async (req, res) => {
  const { title } = req.params;
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { title: { $regex: new RegExp(`^${title}$`, 'i') } }, // ignorira velika/mala slova
      req.body,
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).json({ error: 'Knjiga nije pronađena.' });
    }
    return res.json(updatedBook);
  } catch (error) {
    return res.status(500).json({ error: "Greška pri ažuriranju knjige", details: error.message });
  }
});


app.delete('/api/delete/:title', async (req, res) => {
  const { title } = req.params;
  try {
    // Pronađi knjigu ignorirajući velika/mala slova
    const book = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    if (!book) {
      return res.status(404).json({ error: 'Knjiga nije pronađena.' });
    }
    
    // Ako knjiga ima spremljenu putanju do slike, obriši sliku iz datotečnog sustava - implementiraj nekad
    

    await Book.deleteOne({ _id: book._id });
    return res.json(book);
  } catch (error) {
    console.error("Greška pri brisanju knjige:", error);
    return res.status(500).json({ error: "Greška pri brisanju knjige", details: error.message });
  }
});

// Zamena ruta za dummy mod
if (useDummyData) {
  app.get('/api/getbooks', (req, res) => {
    res.json({ books: dummyBooks });
  });

  app.get('/api/users', (req, res) => {
    res.json({ users: dummyUsers });
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = dummyUsers.find(u => u.username === username);
    if (!user) return res.status(400).json({ error: 'Korisnik nije pronađen' });
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ error: 'Pogrešna lozinka' });
      const token = jwt.sign({ id: user._id, role: user.role }, 'dummy_secret', { expiresIn: '1h' });
      res.status(200).json({ token, user });
    });
  });

  app.post('/api/register', (req, res) => {
    const { email, username, password } = req.body;
    if (dummyUsers.find(u => u.email === email)) return res.status(400).json({ error: 'Email već postoji!' });
    if (dummyUsers.find(u => u.username === username)) return res.status(400).json({ error: 'Username već postoji!' });
    bcrypt.hash(password, 10, (err, hash) => {
      const newUser = { _id: (dummyUsers.length+1).toString(), email, username, password: hash, role: 'user', rentedBooks: [] };
      dummyUsers.push(newUser);
      res.status(201).json({ message: 'Korisnik uspješno registriran!' });
    });
  });

  app.get('/api/reservations', (req, res) => {
    res.json({ reservations: dummyLoans });
  });

  app.post('/api/loans', (req, res) => {
    const { userId, bookId } = req.body;
    const user = dummyUsers.find(u => u._id === userId);
    const book = dummyBooks.find(b => b._id === bookId);
    if (!user || !book) return res.status(404).json({ error: 'User ili knjiga nije pronađena' });
    if (book.availableCopies <= 0) return res.status(400).json({ error: 'Nema dostupnih primjeraka' });
    if (dummyLoans.find(l => l.userId === userId && l.bookId === bookId && !l.returnDate)) return res.status(400).json({ error: 'Već ste posudili tu knjigu' });
    book.availableCopies -= 1;
    user.rentedBooks.push(bookId);
    const loan = { userId, bookId, loanDate: new Date(), returnDate: null };
    dummyLoans.push(loan);
    res.status(201).json({ message: 'Knjiga uspješno posuđena', loan });
  });

  app.put('/api/return/:bookId', (req, res) => {
    const { bookId } = req.params;
    const { userId } = req.body;
    const user = dummyUsers.find(u => u._id === userId);
    const book = dummyBooks.find(b => b._id === bookId);
    if (!user || !book) return res.status(404).json({ error: 'User ili knjiga nije pronađena' });
    const loan = dummyLoans.find(l => l.userId === userId && l.bookId === bookId && !l.returnDate);
    if (!loan) return res.status(400).json({ error: 'Loan not found' });
    loan.returnDate = new Date();
    book.availableCopies += 1;
    user.rentedBooks = user.rentedBooks.filter(id => id !== bookId);
    res.json({ message: 'Book successfully returned', book });
  });

  // Dodavanje, ažuriranje i brisanje knjiga (admin)
  app.post('/api/books', (req, res) => {
    const { title, author, genre, publishedYear, availableCopies, totalCopies } = req.body;
    const newBook = { _id: (dummyBooks.length+1).toString(), title, author, genre, publishedYear, availableCopies, totalCopies, imageUrl: '' };
    dummyBooks.push(newBook);
    res.status(201).json({ message: 'Knjiga uspješno dodana!', book: newBook });
  });

  app.put('/api/title/:title', (req, res) => {
    const { title } = req.params;
    const book = dummyBooks.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (!book) return res.status(404).json({ error: 'Knjiga nije pronađena.' });
    Object.assign(book, req.body);
    res.json(book);
  });

  app.delete('/api/delete/:title', (req, res) => {
    const { title } = req.params;
    const index = dummyBooks.findIndex(b => b.title.toLowerCase() === title.toLowerCase());
    if (index === -1) return res.status(404).json({ error: 'Knjiga nije pronađena.' });
    const [deleted] = dummyBooks.splice(index, 1);
    res.json(deleted);
  });
}











