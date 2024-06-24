const Media = require("../Models/Media");
const fs = require("fs");
const path = require("path");

exports.getAll = async (req, res) => {
  try {
    const media = await Media.find();
    res.json(media);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.create = async (req, res) => {
  const { name } = req.body;
  let videosPaths = [];
  const dir = path.join("public/videos", name);

  if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
  }

  if (!fs.existsSync("public/videos")) {
    fs.mkdirSync("public/videos");
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  if (Array.isArray(req.files) && req.files.length > 0) {
    for (let file of req.files) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      const newFilename = name + "-" + uniqueSuffix + path.extname(file.originalname);
      const filePath = path.join(dir, newFilename);
      fs.writeFileSync(filePath, file.buffer);
      videosPaths.push("/" + filePath.replace(/\\/g, "/"));
    }
  }

  try {
    const createdMedia = await Media.create({
      name,
      videos: videosPaths,
    });

    res.json({ message: "Media created successfully", createdMedia });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
