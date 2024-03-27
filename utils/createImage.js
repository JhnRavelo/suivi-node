const { createFile } = require("./createFile");

const createImage = async (req, imgPath, sharp, path, fs) => {
  const galleryArray = new Array();
  const response = req.files.map(async (file) => {
    if (file.mimetype.split("/")[0] == "image") {
      let webpData = await sharp(file.buffer).webp().toBuffer();
      const { location } = createFile(
        file.originalname.split(".")[0],
        webpData,
        fs,
        path,
        "webp",
        imgPath,
        "public"
      );
      galleryArray.push(location);
    }
  });
  await Promise.all(response);
  return galleryArray.join(",");
};

module.exports = createImage;
