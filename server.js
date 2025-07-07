const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

// Load .env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI);
const dbName = "passop";

client.connect()
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Routes

    // GET all passwords
    app.get("/", async (req, res) => {
      try {
        const db = client.db(dbName);
        const collection = db.collection("Passwords");
        const findResult = await collection.find({}).toArray();
        res.status(200).json(findResult);
      } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch", error: err.message });
      }
    });

    // POST new password
    app.post("/", async (req, res) => {
      try {
        const newPassword = req.body;
        const db = client.db(dbName);
        const collection = db.collection("Passwords");
        const result = await collection.insertOne(newPassword);
        res.status(201).json({ success: true, result });
      } catch (err) {
        res.status(500).json({ success: false, message: "Failed to insert", error: err.message });
      }
    });

    // DELETE a password
    app.delete("/", async (req, res) => {
      const { id } = req.body;
      try {
        const db = client.db(dbName);
        const collection = db.collection("Passwords");

        let deleteResult;
        if (ObjectId.isValid(id)) {
          // Try MongoDB _id
          deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        } else {
          // Fallback to custom id field
          deleteResult = await collection.deleteOne({ id: id });
        }

        res.status(200).json({ success: true, result: deleteResult });
      } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete", error: err.message });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });
