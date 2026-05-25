const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

const router = express.Router();

router.post("/:photoId", async (request, response) => {
  const { photoId } = request.params;
  const commentText =
    typeof request.body.comment === "string" ? request.body.comment.trim() : "";

  if (!mongoose.isValidObjectId(photoId)) {
    return response.status(400).json({ message: `Invalid photo id: ${photoId}` });
  }

  if (!commentText) {
    return response.status(400).json({ message: "Comment must not be empty." });
  }

  try {
    const [photo, user] = await Promise.all([
      Photo.findById(photoId),
      User.findById(request.session.userId)
        .select("_id first_name last_name")
        .lean(),
    ]);

    if (!photo) {
      return response
        .status(400)
        .json({ message: `Photo with id ${photoId} was not found.` });
    }

    if (!user) {
      return response.status(401).json({ message: "Unauthorized." });
    }

    const comment = {
      comment: commentText,
      date_time: new Date(),
      user_id: request.session.userId,
    };

    photo.comments.push(comment);
    await photo.save();

    const savedComment = photo.comments[photo.comments.length - 1];
    response.json({
      _id: savedComment._id,
      comment: savedComment.comment,
      date_time: savedComment.date_time,
      user,
    });
  } catch (error) {
    response.status(500).json({ message: "Unable to add comment." });
  }
});

module.exports = router;
