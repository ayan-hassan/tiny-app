const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

//---------------- HELPER FUNCTIONS -------------------//

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
    if (user === cookie) {
      return true;
    }
  }
  return false;
};

//checks if URLs' useriD matches the currently logged in user
const urlsforUser = (id) => {
  let result = {};
  for (const user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      result[user] = urlDatabase[user];
    }
  }
  return result;
};

//------------------------ROUTES-----------------------------//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//displays all saved urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!cookieIsCurrentUser(req.cookies["user_id"], users)) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//creates new tinyurl
app.post("/urls", (req, res) => {
  if (cookieIsCurrentUser(req.cookies["user_id"], users)) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"],
    };
    res.redirect(`/urls/${tinyURL}`);
  } else {
    res.status(401).send("Please log in with a valid account in order to create tiny URLs.");
  }
});

//single url page
app.get("/urls/:id", (req, res) => {
  let tinyURL = req.params.id;
  if (!cookieIsCurrentUser(req.cookies["user_id"], users)) {
    res.send("If you own this tiny URL, please login in order to view/ edit it.");
  }
  if (req.cookies["user_id"] !== urlDatabase[tinyURL].userID) {
    res.send("This link is not associatd with your account.");
  }
  if (urlDatabase[req.params.id]) {
    let templateVars = {
      tinyURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      urlUserID: urlDatabase[req.cookies["user_id"]].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The tiny URL you entered does not correspond with a registered long URL.");
  }

});

//redirect to longurl
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

//delete tinyurl
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsforUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const tinyURL = req.params.id;
    delete urlDatabase[tinyURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to delete this tiny URL.");
  }
});

//edit longurl
app.post("/urls/:id", (req, res) => {
  let tinyURL = req.params.id;
  let newLongURL = req.body.newURL;
  console.log(req.body);
  if (req.cookies["user_id"] === urlDatabase[tinyURL].userID) {
    urlDatabase[tinyURL].longURL = newLongURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You are not authorized to edit this tiny URL.");
  }
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
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_register", templateVars);
  }
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
