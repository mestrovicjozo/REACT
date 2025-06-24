const express = require("express");
const bcrypt = require("bcrypt");
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Fiktivni server sluša zahtjeve na portu ${PORT}`);
});

// Dummy podaci
const dummyBooks = [
  { _id: '1', title: 'Dummy Book 1', author: 'Autor 1', genre: 'Roman', publishedYear: 2020, availableCopies: 2, totalCopies: 2, imageUrl: '' },
  { _id: '2', title: 'Dummy Book 2', author: 'Autor 2', genre: 'Poezija', publishedYear: 2021, availableCopies: 1, totalCopies: 1, imageUrl: '' }
];
const dummyUsers = [
  { _id: '1', email: 'test@test.com', username: 'test', password: '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', role: 'user', rentedBooks: [] }, // password: test
  { _id: '2', email: 'admin@test.com', username: 'admin', password: '$2b$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', role: 'admin', rentedBooks: [] }
];
const dummyLoans = [];

// API rute
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