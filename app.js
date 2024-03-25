const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
const db = require("./database/models");
const fs = require("fs");
const generateRandomText = require("./utils/generateRandomText");

const app = express();

const pathExport = path.join(__dirname, "database", "export");

db.sequelize.sync().then(() => {
  app.listen(process.env.SERVER_PORT, async () => {
    try {
      const user = await db.users.findOne({
        where: { role: process.env.PRIME },
      });
      if (user) {
        const stringDataUser = db.users.prototype.generateData(user);
        const { location } = createFile(
          generateRandomText(10),
          stringDataUser,
          fs,
          path,
          "tmp",
          pathExport,
          "tmpApp"
        );
        if (!location) return console.log("ERROR CREATE FILE");
        fs.readdir(pathExport, (err, files) => {
          if (err) return console.log("ERROR READ DIRECTORY", err);
          const tempFile = files.find((item) => item.includes(".tmp"));
          fs.unlinkSync(path.join(pathExport, tempFile));
        });
      } else {
        fs.readdir(pathExport, async (err, files) => {
          if (err) return console.log("ERROR READ DIRECTORY", err);
          const tempFile = files.find((item) => item.includes(".tmp"));
          await createUserViaTmp(fs, path.join(pathExport, tempFile), jwt, db);
        });
      }
    } catch (error) {
      console.log("ERROR SAVE USER", error);
    }
    console.log(`http://localhost:${process.env.SERVER_PORT}`);
  });
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.get("Origin") || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);
app.use(express.static("public/"));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const suivisRouter = require("./routers/suivisRouter");
app.use("/suivi", suivisRouter);
const usersRouter = require("./routers/usersRouter");
app.use("/auth", usersRouter);
const refreshRouter = require("./routers/refreshRouter");
app.use("/refresh", refreshRouter);
const productTypesRouter = require("./routers/productTypesRouter");
app.use("/productType", productTypesRouter);
const productsRouter = require("./routers/productsRouter");
app.use("/product", productsRouter);
const logsRouter = require("./routers/logsRouter");
app.use("/log", logsRouter);
const problemsRouter = require("./routers/problemsRouter");
app.use("/problem", problemsRouter);
const databaseRouter = require("./routers/databaseRouter");
const { createFile } = require("./utils/createFile");
const { where } = require("sequelize");
const createUserViaTmp = require("./utils/createUserViaTmp");
app.use("/data", databaseRouter);
