const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://globetrotting-urge-client.vercel.app/",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    console.log("MongoDB Connected Successfully!");

    const db = client.db("globetrotting-urge");

    const destinationCollection = db.collection("destinations");
    const bookingCollection = db.collection("bookings");

    // =========================
    // Root Route
    // =========================
    app.get("/", (req, res) => {
      res.send("Server is running fine!");
    });

    // =========================
    // Get All Destinations
    // =========================
    app.get("/destination", async (req, res) => {
      try {
        const result = await destinationCollection.find().toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Add Destination
    // =========================
    app.post("/destination", async (req, res) => {
      try {
        const destinationData = req.body;

        const result =
          await destinationCollection.insertOne(destinationData);

        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Get Single Destination
    // =========================
    app.get("/destination/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Destination ID",
          });
        }

        const result = await destinationCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Destination not found",
          });
        }

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Update Destination
    // =========================
    app.patch("/destination/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Destination ID",
          });
        }

        const result = await destinationCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: updatedData,
          },
        );

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Delete Destination
    // =========================
    app.delete("/destination/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Destination ID",
          });
        }

        const result = await destinationCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Get User Bookings
    // =========================
    app.get("/booking/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const result = await bookingCollection
          .find({ userId: userId })
          .toArray();

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Add Booking
    // =========================
    app.post("/booking", async (req, res) => {
      try {
        const bookingData = req.body;

        const result = await bookingCollection.insertOne(bookingData);

        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // =========================
    // Delete Booking
    // =========================
    app.delete("/booking/:bookingId", async (req, res) => {
      try {
        const { bookingId } = req.params;

        if (!ObjectId.isValid(bookingId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Booking ID",
          });
        }

        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(bookingId),
        });

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // MongoDB Ping
    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB Ping Successful!");
  } catch (error) {
    console.error("Server Error:", error);
  }
}

run();

// Start Server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});