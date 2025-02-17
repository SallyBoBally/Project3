const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const connectDB = require("./db");
const Card = require("./models/card");
const fetchMarketValue = require("./services/ebayService"); // updated to ebayService
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("track_card", async (cardName) => {
    const marketValue = await fetchMarketValue(cardName);

    if (marketValue !== null) {
      const card = await Card.findOneAndUpdate(
        { name: cardName },
        { marketValue, lastUpdated: new Date() },
        { new: true, upsert: true }
      );

      io.emit("market_update", card);
    } else {
      console.error(`No market value found for "${cardName}"`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/cards", async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

server.listen(3000, () => {
  console.log("Server running on port 3000...");
});