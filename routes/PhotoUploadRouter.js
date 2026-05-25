const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Photo = require("../db/photoModel");

const router = express.Router();
const imagesDirectory = path.join(__dirname, "..", "images");

fs.mkdirSync(imagesDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, imagesDirectory);
  },
  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    callback(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/new", upload.single("photo"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: "No photo file uploaded." });
  }

  try {
    const photo = await Photo.create({
      file_name: request.file.filename,
      date_time: new Date(),
      user_id: request.session.userId,
      comments: [],
    });

    response.json({
      _id: photo._id,
      user_id: photo.user_id,
      comments: [],
      file_name: photo.file_name,
      date_time: photo.date_time,
    });
  } catch (error) {
    fs.unlink(request.file.path, () => {});
    response.status(500).json({ message: "Unable to upload photo." });
  }
});

module.exports = router;
