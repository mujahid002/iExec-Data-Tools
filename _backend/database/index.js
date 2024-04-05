const ethers = require("ethers");
const connectMongo = require("./connect-mongo");

const storeProtectedData = async (req, res) => {
  try {
    const { protectedData } = req.body;
    const client = await connectMongo();
    const db = client.db("iExecData");
    const collection = db.collection("protectedData");

    // Insert one document
    await collection.insertOne({
      protectedData,
    });

    console.log("protected data stored successfully.");
    res.sendStatus(200);
    await client.close();
  } catch (error) {
    console.error("Error while running storeProtectedData:", error);
    res.status(500).send("Internal Server Error");
  }
};
const fetchAllData = async () => {
  try {
    const client = await connectMongo();
    const db = client.db("iExecData");
    const collection = db.collection("protectedData");

    const data = await collection.find({}, { _id: 1 }).toArray();

    console.log("All data fetched successfully:", data);

    await client.close();
    return data;
  } catch (error) {
    console.error("Error while fetching all protected data:", error);
  }
};

module.exports = {
  storeProtectedData,
  fetchAllData,
};
