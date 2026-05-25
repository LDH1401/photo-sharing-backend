const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

function loggedInUserFields() {
  return "_id login_name first_name last_name";
}

router.post("/login", async (request, response) => {
  const { login_name: loginName, password } = request.body;

  if (!loginName || typeof loginName !== "string") {
    return response.status(400).json({ message: "Missing login_name." });
  }

  if (!password || typeof password !== "string") {
    return response.status(400).json({ message: "Missing password." });
  }

  try {
    const user = await User.findOne({ login_name: loginName.trim() })
      .select(`${loggedInUserFields()} password`)
      .lean();

    if (!user || user.password !== password) {
      return response
        .status(400)
        .json({ message: "Invalid login_name or password." });
    }

    request.session.userId = user._id.toString();
    response.json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    response.status(500).json({ message: "Unable to login." });
  }
});

router.post("/logout", (request, response) => {
  if (!request.session.userId) {
    return response.status(400).json({ message: "No user is logged in." });
  }

  request.session.destroy((error) => {
    if (error) {
      return response.status(500).json({ message: "Unable to logout." });
    }

    response.clearCookie("connect.sid");
    response.json({ message: "Logout successful." });
  });
});

router.get("/current", async (request, response) => {
  if (!request.session.userId) {
    return response.status(401).json({ message: "Unauthorized." });
  }

  try {
    const user = await User.findById(request.session.userId)
      .select(loggedInUserFields())
      .lean();

    if (!user) {
      request.session.destroy(() => {});
      return response.status(401).json({ message: "Unauthorized." });
    }

    response.json(user);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch current user." });
  }
});

module.exports = router;
