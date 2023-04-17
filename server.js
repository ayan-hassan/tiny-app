const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//------------------------ROUTES-----------------------------//

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//displays all saved urls
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = longURL;
  res.redirect(`urls/${tinyURL}`);
});

//single url page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//redirect to longurl
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//delete tinyurl
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//edit longurl
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.newURL;
  let tinyURL = req.params.id;
  urlDatabase[tinyURL] = longURL;
  res.redirect("/urls");
});

//login with username
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});