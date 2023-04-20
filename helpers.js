//generated random string of six numbers and letters
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

//checks if email matches user in database
const emailHasUser = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (email === userDatabase[user].email) {
      return true;
    }
  }
  return false;
};

///looks up user in database using email and returns matching ID
const getUserID = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

//Checks if current cookie corresponds with a user in database
const cookieIsCurrentUser = (cookie, userDatabase) => {
  for (const user in userDatabase) {
    if (user === cookie) {
      return true;
    }
  }
  return false;
};

//checks if URLs' useriD matches the currently logged in user
const urlsforUser = (id, urlDatabase) => {
  let result = {};
  for (const user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      result[user] = urlDatabase[user];
    }
  }
  return result;
};

module.exports = { generateRandomString, emailHasUser, getUserID, cookieIsCurrentUser, urlsforUser };