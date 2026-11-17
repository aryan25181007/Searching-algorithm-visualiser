const express = require('express');
const { runAlgorithm, listAlgorithms } = require('../algorithms');

const router = express.Router();
const MAX_ITEMS = 30;

// GET /  -> home page with the input form (optionally pre-filled from the query string)
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Search Visualizer',
    algorithms: listAlgorithms(),
    form: {
      array: req.query.array || '12, 5, 33, 8, 21, 47, 3, 19, 40, 27',
      key: req.query.key || '21',
      algorithm: req.query.algorithm || 'binary',
    },
    error: null,
  });
});

// POST /visualize -> validate the form, run the algorithm, render the animation page
router.post('/visualize', (req, res) => {
  const algorithms = listAlgorithms();
  const form = {
    array: (req.body.array || '').trim(),
    key: (req.body.key || '').trim(),
    algorithm: req.body.algorithm || 'binary',
  };

  const fail = (error) =>
    res.status(400).render('index', { title: 'Search Visualizer', algorithms, form, error });

  const nums = form.array.split(/[\s,]+/).filter(Boolean).map(Number);
  if (nums.length === 0) return fail('Please enter some numbers in the array.');
  if (nums.some((n) => !Number.isFinite(n))) return fail('The array can only contain numbers.');
  if (nums.length > MAX_ITEMS) return fail(`Please use at most ${MAX_ITEMS} numbers so the animation stays readable.`);

  const key = Number(form.key);
  if (form.key === '' || !Number.isFinite(key)) return fail('Please enter a numeric key to search for.');
  if (!algorithms[form.algorithm]) return fail('Please choose one of the algorithms.');

  const result = runAlgorithm(form.algorithm, nums, key);

  res.render('visualize', {
    title: `${algorithms[form.algorithm].name} · Search Visualizer`,
    algo: algorithms[form.algorithm],
    form,
    key,
    original: nums,
    result, // { array, sortedNow, index, steps }
  });
});

// GET /algorithms -> info page about every algorithm
router.get('/algorithms', (req, res) => {
  res.render('algorithms', { title: 'Algorithms · Search Visualizer', algorithms: listAlgorithms() });
});

// Optional JSON API (same logic, handy for testing with Postman/curl)
router.post('/api/search', (req, res) => {
  try {
    const { array, key, algorithm } = req.body || {};
    if (!Array.isArray(array) || array.length === 0 || array.length > MAX_ITEMS) {
      return res.status(400).json({ error: `Provide an array of 1 to ${MAX_ITEMS} numbers.` });
    }
    const nums = array.map(Number);
    if (nums.some((n) => !Number.isFinite(n)) || !Number.isFinite(Number(key))) {
      return res.status(400).json({ error: 'Array and key must be numbers.' });
    }
    res.json(runAlgorithm(algorithm, nums, Number(key)));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
