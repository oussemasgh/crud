const express = require("express");
const mediaController = require("../controllers/mediaController");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Use memory storage to handle file uploads temporarily
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== ".mkv" && ext !== ".mp4") {
      return cb(new Error("Only videos are allowed!"));
    }
    cb(null, true);
  },
});

const router = express.Router();

// Get all media
router.get("/all", mediaController.getAll);

// Post create new media
router.post(
  "/create",
  upload.array("videos", 5),
  mediaController.create
);

module.exports = router;
