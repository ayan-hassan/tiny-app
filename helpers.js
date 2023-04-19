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