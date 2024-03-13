const createImage = async (req, imgPath, sharp, path, fs) => {
    const galleryArray = new Array();
    const response = req.files.map(async (file) => {
      if (file.mimetype.split("/")[0] == "image") {
        let date = new Date();
        let filename = `${file.originalname.split(".")[0]}-${date.getDate()}-${
          date.getMonth() + 1
        }-${date.getFullYear()}-${date.getTime()}.webp`;
        let webpData = await sharp(file.buffer).webp().toBuffer();
        let webpFilePath = path.join(imgPath, filename);
        fs.writeFileSync(webpFilePath, webpData);
        galleryArray.push(`${process.env.SERVER_PATH}/img/${filename}`);
      }
    });
    await Promise.all(response);
    return galleryArray.join(",")
}

module.exports = createImage