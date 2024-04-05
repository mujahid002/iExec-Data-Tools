const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const { storeProtectedData, fetchAllData } = require("./database/index");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/store-protectedData", storeProtectedData);
app.get("/fetch-protectedData", fetchAllData);

const port = process.env.PORT || 5001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);
  //   connectMongo();
});
