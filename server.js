const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ================================
// MIDDLEWARE
// ================================

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));


// ================================
// MONGODB
// ================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI puuttuu .env-tiedostosta!");
} else {

    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("✅ MongoDB connected!");
        })
        .catch((error) => {
            console.error(
                "❌ MongoDB connection error:"
            );

            console.error(error.message);
        });
}


// ================================
// SCORE MODEL
// ================================

const scoreSchema = new mongoose.Schema({

    playerName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },

    score: {
        type: Number,
        required: true,
        min: 0
    },

    wave: {
        type: Number,
        required: true,
        min: 1
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Score =
    mongoose.model("Score", scoreSchema);


// ================================
// TESTI
// ================================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Tower Defense API toimii!",
        mongodb:
            mongoose.connection.readyState === 1
                ? "connected"
                : "not connected"
    });

});


// ================================
// TOP 10
// ================================

app.get("/api/scores", async (req, res) => {

    try {

        // MongoDB ei ole yhdistetty
        if (
            mongoose.connection.readyState !== 1
        ) {

            return res.status(503).json({

                message:
                    "MongoDB ei ole yhdistetty."

            });
        }


        const scores =
            await Score.find({})
                .sort({
                    score: -1,
                    createdAt: 1
                })
                .limit(10)
                .lean();


        res.json(scores);

    } catch (error) {

        console.error(
            "❌ TOP 10 error:",
            error
        );

        res.status(500).json({

            message:
                "TOP 10 -listan hakeminen epäonnistui."

        });
    }

});


// ================================
// TALLENNA PISTEET
// ================================

app.post("/api/scores", async (req, res) => {

    try {

        console.log(
            "📥 Score request:",
            req.body
        );


        // Tarkistetaan MongoDB
        if (
            mongoose.connection.readyState !== 1
        ) {

            console.error(
                "❌ MongoDB ei ole yhdistetty."
            );

            return res.status(503).json({

                message:
                    "MongoDB ei ole yhdistetty."

            });
        }


        let {
            playerName,
            score,
            wave
        } = req.body;


        // ============================
        // NIMI
        // ============================

        if (
            typeof playerName !== "string"
        ) {

            return res.status(400).json({

                message:
                    "Pelaajan nimi puuttuu."

            });
        }


        playerName =
            playerName.trim();


        if (
            playerName.length === 0
        ) {

            return res.status(400).json({

                message:
                    "Pelaajan nimi ei voi olla tyhjä."

            });
        }


        if (
            playerName.length > 20
        ) {

            playerName =
                playerName.substring(0, 20);
        }


        // ============================
        // PISTEET
        // ============================

        score =
            Number(score);


        if (
            !Number.isFinite(score) ||
            score < 0
        ) {

            return res.status(400).json({

                message:
                    "Virheellinen pistemäärä."

            });
        }


        // ============================
        // AALTO
        // ============================

        wave =
            Number(wave);


        if (
            !Number.isFinite(wave) ||
            wave < 1
        ) {

            return res.status(400).json({

                message:
                    "Virheellinen aalto."

            });
        }


        // ============================
        // LUODAAN TULOS
        // ============================

        const newScore =
            new Score({

                playerName:
                    playerName,

                score:
                    Math.floor(score),

                wave:
                    Math.floor(wave)

            });


        // Tallennetaan MongoDB:hen
        const savedScore =
            await newScore.save();


        console.log(
            "✅ Score saved:",
            savedScore
        );


        // ============================
        // VASTAUS
        // ============================

        res.status(201).json({

            message:
                "Pisteet tallennettu!",

            score:
                savedScore

        });


    } catch (error) {

        console.error(
            "❌ Score save error:"
        );

        console.error(error);


        res.status(500).json({

            message:
                "Pisteiden tallentaminen epäonnistui.",

            error:
                error.message

        });

    }

});


// ================================
// SERVER
// ================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================"
        );
        console.log(
            "🎮 TOWER DEFENSE SERVER"
        );
        console.log(
            "================================"
        );
        console.log(
            `🌐 http://localhost:${PORT}`
        );
        console.log(
            "================================"
        );
        console.log("");

    }
);