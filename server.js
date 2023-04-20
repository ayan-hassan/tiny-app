const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();

const PORT = 8080;

const { generateRandomString, emailHasUser, getUserID, cookieIsCurrentUser, urlsforUser } = require("./helpers");

const { urlDatabase, users } = require("./databases");

app.use(express.urlencoded({ extended: true}));

app.use(cookieSession({
  name: 'hello-you',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

//********************************* ROUTES **********************************//

app.get("/", (req, res) => {
  if (cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//------------------------ DISPLAY SAVED URLS -----------------------------//

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsforUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//creates new tinyurl
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${tinyURL}`);
  } else {
    res.status(401).send("Please log in with a valid account in order to create tiny URLs.");
  }
});

//------------------------ ADD NEW TINYURL -----------------------------//

//renders page
app.get("/urls/new", (req, res) => {
  if (!cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

//------------------------ DELETE SAVED URLS -----------------------------//

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsforUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const tinyURL = req.params.id;
    delete urlDatabase[tinyURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to delete this tiny URL.");
  }
});

//------------------------ REDIRECTS TO LONG URL -----------------------------//

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("This tinyURL does not exist.");
  }
});

//------------------------ SINGLE TINYURL PAGE -----------------------------//

app.get("/urls/:id", (req, res) => {
  let tinyURL = req.params.id;
  if (!cookieIsCurrentUser(req.session.user_id, users)) {
    res.send("If you own this tiny URL, please login in order to view/ edit it.");
  } else if (req.session.user_id !== urlDatabase[tinyURL].userID) {
    res.send("This link is not associated with your account.");
  } else if (urlDatabase[req.params.id]) {
    let templateVars = {
      tinyURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      urlUserID: urlDatabase[req.params.id].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The tiny URL you entered does not correspond with a registered long URL.");
  }
});

//------------------------ EDIT SAVED URLS -----------------------------//

app.post("/urls/:id", (req, res) => {
  let tinyURL = req.params.id;
  let newLongURL = req.body.newURL;
  if (req.session.user_id === urlDatabase[tinyURL].userID) {
    urlDatabase[tinyURL].longURL = newLongURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to edit this tiny URL.");
  }
});

//------------------------ REGISTER NEW USER -----------------------------//

//renders register page
app.get("/register", (req, res) => {
  if (cookieIsCurrentUser(req.session.user_id) === true) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_register", templateVars);
  }
});

//adds new user to database
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please register with a valid email and/or password.");
  } else if (emailHasUser(email, users)) {
    return res.status(400).send("This email address is already registered with an account.");
  } else {
    users[randomID] = {
      id: randomID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

//------------------------ LOGIN -----------------------------//

//renders login page
app.get("/login", (req, res) => {
  if (cookieIsCurrentUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

//logs in user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!emailHasUser(email, users)) {
    res.status(403).send("This email address is not associated with an account");
  } else {
    const userID = getUserID(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you have entered doesn't match one associated with the provided email address");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

//------------------------ LOGOUT -----------------------------//

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//----------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
