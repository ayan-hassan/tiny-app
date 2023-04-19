const { assert } = require('chai');

const { generateRandomString, emailHasUser, urlsforUser, cookieIsCurrentUser, getUserID } = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('generateRandomString', function() {
  it('should return a string with six random alphanumeric characters', function() {
    const stringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(stringLength, expectedOutput);
  });

  it('should not return the same string when used multiple times', function() {
    const firstString = generateRandomString();
    const secondString = generateRandomString();
    assert.notEqual(firstString, secondString);
  });
});

describe('emailHasUser', function() {
  it('should return true if email matches a user in the database', function() {
    const existingEmail = emailHasUser("user@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(existingEmail, expectedOutput);
  });

  it('should return false if email does not match a user in the database', function() {
    const fakeEmail = emailHasUser("fake_email@test.com", testUsers);
    const expectedOutput = false;
    assert.equal(fakeEmail, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object from the url database matching the given user ID', function() {
    const specificUrl = urlsforUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    };
    assert.deepEqual(specificUrl, expectedOutput);
  });
});

describe('cookieIsCurrentUser', function() {

  it('should return true if a cookie corresponds to a user in the database', function() {
    const currentCookie = cookieIsCurrentUser("userRandomID", testUsers);
    const expectedOutput = true;
    assert.equal(currentCookie, expectedOutput);
  });

  it('should return false if a cookie does not correspond to a user in the database', function() {
    const fakeCookie = cookieIsCurrentUser("user3RandomID", testUsers);
    const expectedOutput = false;
    assert.equal(fakeCookie, expectedOutput);
  });
});

describe('getUserID', function() {
  it('should return a user with a valid email', function() {
    const user = getUserID("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when does not exist in database for a given email address', function() {
    const user = getUserID("me@test.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});