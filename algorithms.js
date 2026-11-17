// Each algorithm returns the index of the key (or -1) and pushes
// "steps" that the frontend animates one by one.
//
// Step shape:
//   msg      - explanation shown to the user
//   compare  - array of indices being compared right now
//   pointers - { label: index } pointer tags drawn above the boxes
//   range    - [lo, hi] part of the array still being searched (optional)

function binaryRange(arr, key, lo, hi, steps) {
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      msg: `low = ${lo}, high = ${hi}  →  mid = ${mid}. Compare arr[${mid}] = ${arr[mid]} with ${key}.`,
      compare: [mid],
      pointers: { low: lo, mid, high: hi },
      range: [lo, hi],
    });
    if (arr[mid] === key) return mid;
    if (arr[mid] < key) {
      steps.push({
        msg: `${arr[mid]} < ${key}, so the key must be on the right. Discard the left half → low = ${mid + 1}.`,
        compare: [],
        pointers: { low: lo, mid, high: hi },
        range: [mid + 1, hi],
      });
      lo = mid + 1;
    } else {
      steps.push({
        msg: `${arr[mid]} > ${key}, so the key must be on the left. Discard the right half → high = ${mid - 1}.`,
        compare: [],
        pointers: { low: lo, mid, high: hi },
        range: [lo, mid - 1],
      });
      hi = mid - 1;
    }
  }
  return -1;
}

function linear(arr, key, steps) {
  for (let i = 0; i < arr.length; i++) {
    steps.push({
      msg: `Check arr[${i}] = ${arr[i]}. ${arr[i] === key ? 'It matches!' : `Not equal to ${key}, move on.`}`,
      compare: [i],
      pointers: { i },
    });
    if (arr[i] === key) return i;
  }
  return -1;
}

function binary(arr, key, steps) {
  return binaryRange(arr, key, 0, arr.length - 1, steps);
}

const ALGORITHMS = {
  linear: {
    name: 'Linear Search',
    requiresSorted: false,
    best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)',
    desc: 'Checks every element one by one from the start. Works on any array.',
    run: linear,
  },
  binary: {
    name: 'Binary Search',
    requiresSorted: true,
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)',
    desc: 'Looks at the middle element and throws away half of the array every step.',
    run: binary,
  },
};

function runAlgorithm(id, inputArray, key) {
  const algo = ALGORITHMS[id];
  if (!algo) throw new Error('Unknown algorithm');
  const wasSorted = inputArray.every((v, i, a) => i === 0 || a[i - 1] <= v);
  const sortedNow = algo.requiresSorted && !wasSorted;
  const arr = sortedNow ? [...inputArray].sort((a, b) => a - b) : [...inputArray];

  const steps = [];
  if (sortedNow) {
    steps.push({
      msg: `${algo.name} needs a sorted array, so the array was sorted first.`,
      compare: [],
      pointers: {},
    });
  } else {
    steps.push({
      msg: `Searching for ${key} using ${algo.name}.`,
      compare: [],
      pointers: {},
    });
  }

  const index = algo.run(arr, key, steps);
  if (index >= 0) {
    steps.push({ msg: `Found ${key} at index ${index}! 🎉`, compare: [], pointers: { found: index }, found: index });
  } else {
    steps.push({ msg: `${key} is not present in the array.`, compare: [], pointers: {}, notFound: true });
  }

  return { array: arr, sortedNow, index, steps };
}

function listAlgorithms() {
  const out = {};
  for (const [id, a] of Object.entries(ALGORITHMS)) {
    const { run, ...meta } = a;
    out[id] = meta;
  }
  return out;
}

module.exports = { runAlgorithm, listAlgorithms, ALGORITHMS };
