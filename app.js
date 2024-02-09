const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./database/models");

const app = express();

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`http://localhost:${process.env.SERVER_PORT}`);
  });
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
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
