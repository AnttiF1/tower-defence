const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ================================
// MIDDLEWARE
// ================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ================================
// TESTI
// ================================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Tower Defense API toimii!",
        server: "Express",
        leaderboard: "AWS Lambda + DynamoDB"
    });

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
            "☁️ Leaderboard: AWS Lambda + DynamoDB"
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);