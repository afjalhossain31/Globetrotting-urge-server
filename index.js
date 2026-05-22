const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;
const allowedOrigins = [process.env.BETTER_AUTH_URL].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let clientConnectionPromise;

async function connectMongo() {
  if (!clientConnectionPromise) {
    clientConnectionPromise = client.connect();
  }

  return clientConnectionPromise;
}

async function getCollections() {
  await connectMongo();

  const db = client.db("globetrotting-urge");

  return {
    destinationCollection: db.collection("destinations"),
    bookingCollection: db.collection("bookings"),
  };
}

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

app.get(["/destination", "/destinations"], async (req, res) => {
  try {
    const { destinationCollection } = await getCollections();
    const result = await destinationCollection.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post(["/destination", "/destinations"], async (req, res) => {
  try {
    const { destinationCollection } = await getCollections();
    const destinationData = req.body;
    const result = await destinationCollection.insertOne(destinationData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get(["/destination/:id", "/destinations/:id"], async (req, res) => {
  try {
    const { destinationCollection } = await getCollections();
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

app.patch(["/destination/:id", "/destinations/:id"], async (req, res) => {
  try {
    const { destinationCollection } = await getCollections();
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

app.delete(["/destination/:id", "/destinations/:id"], async (req, res) => {
  try {
    const { destinationCollection } = await getCollections();
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

app.get(["/booking/:userId", "/bookings/:userId"], async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();
    const { userId } = req.params;

    const result = await bookingCollection.find({ userId }).toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post(["/booking", "/bookings"], async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();
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

app.delete(["/booking/:bookingId", "/bookings/:bookingId"], async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();
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

app.get("/bookings", async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();
    const result = await bookingCollection.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

async function run() {
  try {
    await connectMongo();
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("Server Error:", error);
  }
}

run();

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
