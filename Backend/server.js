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

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    usersCollection = db.collection("users_collection");
    console.log("✅ Connected to MongoDB Atlas with Driver");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Stop server if DB fails
  }
}
connectDB();

// --- CREATE USER ---
app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Basic validation
    if (!name || !email || !age) {
      return res.status(400).send({ error: "Name, email, and age are required" });
    }

    const result = await usersCollection.insertOne({ name, email, age });
    res.status(201).send(result);
  } catch (err) {
    console.error("POST /users Error:", err);
    res.status(500).send({ error: "Failed to create user" });
  }
});

// --- READ USERS ---
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.send(users);
  } catch (err) {
    console.error("GET /users Error:", err);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// --- UPDATE USER ---
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    const { name, email, age } = req.body;
    if (!name && !email && !age) {
      return res.status(400).send({ error: "At least one field (name, email, age) is required" });
    }

    const updateDoc = { $set: {} };
    if (name) updateDoc.$set.name = name;
    if (email) updateDoc.$set.email = email;
    if (age) updateDoc.$set.age = age;

    const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ message: "User updated successfully" });
  } catch (err) {
    console.error("PUT /users/:id Error:", err);
    res.status(500).send({ error: "Failed to update user" });
  }
});

// --- DELETE USER ---
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /users/:id Error:", err);
    res.status(500).send({ error: "Failed to delete user" });
  }
});

// --- START SERVER ---
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
