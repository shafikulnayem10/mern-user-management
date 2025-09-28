import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    usersCollection = db.collection("users_collection");
    console.log("✅ Connected to MongoDB Atlas with Driver");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
connectDB();

// CREATE
app.post("/users", async (req, res) => {
  try {
    const result = await usersCollection.insertOne(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// READ
app.get("/users", async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.send(users);
});

// UPDATE
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDoc = { $set: req.body };
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      updatedDoc
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
