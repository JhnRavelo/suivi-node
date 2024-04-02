const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./database/models")
require("dotenv").config();
const app = express();

db.sequelize.options.logging = false;
db.sequelize.sync().then(() => {
  app.listen(process.env.SERVER_PORT, async () => {
    const fileHandler = new FileHandler
    try {
      const user = await db.users.findOne({
        where: { role: process.env.PRIME },
      });
      fileHandler.generateUser(user)
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
const FileHandler = require("./class/fileHandler");
app.use("/data", databaseRouter);
