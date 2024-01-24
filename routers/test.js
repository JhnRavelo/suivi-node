const fs = require("fs");
const path = require("path");

const imgPath = path.join(
  __dirname,
  "..",
  "public",
  "img"
);

fs.readdir(imgPath, (err, files) => {
  if (err) {
    console.error("Erreur lors de la lecture du dossier :", err);
  }

  // Filtrer les fichiers PNG
  const pngFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".png"
  );
  if (pngFiles) {
    // Supprimer chaque fichier PNG
    pngFiles.forEach((pngFile) => {
      const filePath = path.join(imgPath, pngFile);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(
            `Erreur lors de la suppression de ${pngFile} :`,
            err
          );
        } else {
          console.log(`${pngFile} a été supprimé avec succès.`);
        }
      });
    });
  }
});
