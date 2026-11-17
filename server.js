const express = require('express');
const path = require('path');
const mainRoutes = require('./routes/main');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- view engine: EJS templates live in /views ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- middleware ----
app.use(express.urlencoded({ extended: false })); // reads <form method="POST"> data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// values every EJS template can use
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ---- routes ----
app.use('/', mainRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).render('error', { title: 'Page not found', code: 404, message: 'That page does not exist.' });
});

// ---- error handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Server error', code: 500, message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Search Visualizer running at http://localhost:${PORT}`);
});
