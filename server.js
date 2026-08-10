const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/status", (req, res) => {
    res.json({
        message: "Tower Defense API toimii!"
    });
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB yhdistetty");

        app.listen(PORT, () => {
            console.log(`Palvelin käynnissä: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB-yhteys epäonnistui:", error);
    });

