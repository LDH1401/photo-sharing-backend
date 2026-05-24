const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();

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
