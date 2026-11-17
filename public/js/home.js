// Home page only: the random-array button.
document.getElementById('randomBtn').addEventListener('click', () => {
  const n = 10 + Math.floor(Math.random() * 6);
  const set = new Set();
  while (set.size < n) set.add(1 + Math.floor(Math.random() * 99));
  const arr = [...set];
  document.getElementById('arrayInput').value = arr.join(', ');
  document.getElementById('keyInput').value = arr[Math.floor(Math.random() * arr.length)];
});
