const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./database/models");

const app = express();

db.sequelize.sync({alter: true}).then(() => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`http://localhost:${process.env.SERVER_PORT}`);
  });
});

app.use(
  cors({
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const usersRouter = require("./routers/usersRouter");
app.use("/auth", usersRouter);
const refreshRouter = require("./routers/refreshRouter");
app.use("/refresh", refreshRouter);
const productTypesRouter = require("./routers/productTypesRouter")
app.use("/productType", productTypesRouter)
const productsRouter = require("./routers/productsRouter")
app.use("/product", productsRouter)
const suivisRouter = require("./routers/suivisRouter")
app.use("/suivi", suivisRouter)