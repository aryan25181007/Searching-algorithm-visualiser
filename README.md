# Search Visualizer (Express + EJS)

Enter an array and a key, pick a searching algorithm, and watch an animation of how it finds the key.

## Run

```bash
npm install
npm start
```

Open http://localhost:3000

## Project structure

```
server.js              Express app: EJS setup, middleware, routes, 404 + error pages
routes/main.js         Routes: GET /, POST /visualize, GET /algorithms, POST /api/search
algorithms.js          Linear and Binary search; each one records its steps
views/
  partials/header.ejs  shared <head> + navbar (included by every page)
  partials/footer.ejs  shared footer
  index.ejs            home page: form (array, key, algorithm cards)
  visualize.ejs        animation page rendered by Express after the form is submitted
  algorithms.ejs       info page (loops over all algorithms with complexity table)
  error.ejs            404 / 500 page
public/
  css/style.css
  js/home.js           random array button
  js/visualizer.js     plays the steps as an animation
```

## Request flow

1. `GET /` renders `index.ejs` (the form).
2. The form submits `POST /visualize`. Express validates the input, runs the algorithm
   on the server and calls `res.render('visualize', {...})`.
3. `visualize.ejs` embeds the steps as JSON; `visualizer.js` animates them.
4. On bad input the form page is rendered again with the error message.
