const deleteImage = async (gallery, imgPath, fs, path) => {
  let name = gallery.split("/")[gallery.split("/").length - 1];
  let pathFile = path.join(imgPath, name);
  fs.unlinkSync(pathFile, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

module.exports = deleteImage;
