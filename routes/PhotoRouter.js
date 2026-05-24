const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

router.get("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ message: `Invalid user id: ${id}` });
  }

  try {
    const userQuery = User.findById(id).select("_id").lean();
    const photosQuery = Photo.find({ user_id: id })
      .select("_id user_id comments file_name date_time")
      .lean();

    const [user, photos] = await Promise.all([userQuery, photosQuery]);

    if (!user) {
      return response
        .status(400)
        .json({ message: `User with id ${id} was not found.` });
    }

    const commentUserIds = [
      ...new Set(
        photos.flatMap((photo) =>
          (photo.comments || []).map((comment) => comment.user_id.toString()),
        ),
      ),
    ];

    const commentUsers = await User.find({ _id: { $in: commentUserIds } })
      .select("_id first_name last_name")
      .lean();

    const commentUserById = new Map(
      commentUsers.map((commentUser) => [commentUser._id.toString(), commentUser]),
    );

    const photoModels = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: commentUserById.get(comment.user_id.toString()),
      })),
      file_name: photo.file_name,
      date_time: photo.date_time,
    }));

    response.json(photoModels);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch photos for user." });
  }
});

module.exports = router;
