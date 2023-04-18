const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

const emailHasUser = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (email === userDatabase[user].email) {
      return true;
    }
  }
  return false;
};

const getUserID = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const cookieIsCurrentUser = (cookie, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].id === cookie) {
      return true;
    }
  }
  return false;
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

//displays all saved urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//creates new tinyurl
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = longURL;
  res.redirect(`urls/${tinyURL}`);
});

//single url page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
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


app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//register new user
app.get("/register", (req, res) => {
  if (cookieIsCurrentUser(req.cookies["user_id"], users)) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Please register with a valid email and/or password.");
  }
  if (emailHasUser(email, users)) {
    return res.status(400).send("This email address is already registered with an account.");
  }
  users[randomID] = {
    id: randomID,
    email: email,
    password: password
  };
  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) => {
  if (cookieIsCurrentUser(req.cookies["user_id"], users)) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("This email address is not associated with an account");
  } else {
    const userID = getUserID(email, users);
    if (password !== users[userID].password) {
      res.status(403).send("The password you have entered doesn't match one associated with the provided email address");
    } else {
      res.cookie("user_id", userID);
      res.redirect("/urls");
    }
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
