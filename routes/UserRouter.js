const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();

const requiredRegistrationFields = [
  "login_name",
  "password",
  "first_name",
  "last_name",
];

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

router.post("/", async (request, response) => {
  const registration = {
    login_name: cleanString(request.body.login_name),
    password: cleanString(request.body.password),
    first_name: cleanString(request.body.first_name),
    last_name: cleanString(request.body.last_name),
    location: cleanString(request.body.location),
    description: cleanString(request.body.description),
    occupation: cleanString(request.body.occupation),
  };

  const missingField = requiredRegistrationFields.find(
    (field) => registration[field].length === 0,
  );

  if (missingField) {
    return response
      .status(400)
      .send(`${missingField} must be a non-empty string.`);
  }

  try {
    const existingUser = await User.findOne({
      login_name: registration.login_name,
    }).lean();

    if (existingUser) {
      return response.status(400).send("login_name already exists.");
    }

    const user = await User.create(registration);
    response.json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
  } catch (error) {
    response.status(500).json({ message: "Unable to register user." });
  }
});

router.get("/list", async (request, response) => {
  try {
    const users = await User.find({})
      .select("_id first_name last_name")
      .lean();

    response.json(users);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user list." });
  }
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ message: `Invalid user id: ${id}` });
  }

  try {
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();

    if (!user) {
      return response
        .status(400)
        .json({ message: `User with id ${id} was not found.` });
    }

    response.json(user);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user details." });
  }
});

module.exports = router;
