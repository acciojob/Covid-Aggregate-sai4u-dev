const express = require("express");
const app = express();

const { CovidTally } = require("./connector");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).send("HELLO WORLD");
});

// Total Recovered
app.get("/totalRecovered", async (req, res) => {
  try {
    const result = await CovidTally.aggregate([
      {
        $group: {
          _id: "total",
          recovered: {
            $sum: "$recovered"
          }
        }
      }
    ]);

    res.status(200).json({
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Total Active
app.get("/totalActive", async (req, res) => {
  try {
    const result = await CovidTally.aggregate([
      {
        $group: {
          _id: "total",
          active: {
            $sum: {
              $subtract: ["$infected", "$recovered"]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Total Death
app.get("/totalDeath", async (req, res) => {
  try {
    const result = await CovidTally.aggregate([
      {
        $group: {
          _id: "total",
          death: {
            $sum: "$death"
          }
        }
      }
    ]);

    res.status(200).json({
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Hotspot States
app.get("/hotspotStates", async (req, res) => {
  try {
    const result = await CovidTally.aggregate([
      {
        $project: {
          _id: 0,
          state: 1,
          rate: {
            $round: [
              {
                $divide: [
                  {
                    $subtract: ["$infected", "$recovered"]
                  },
                  "$infected"
                ]
              },
              5
            ]
          }
        }
      },
      {
        $match: {
          rate: {
            $gt: 0.1
          }
        }
      },
      {
        $sort: {
          state: 1
        }
      }
    ]);

    res.status(200).json({
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Healthy States
app.get("/healthyStates", async (req, res) => {
  try {
    const result = await CovidTally.aggregate([
      {
        $project: {
          _id: 0,
          state: 1,
          mortality: {
            $round: [
              {
                $divide: ["$death", "$infected"]
              },
              5
            ]
          }
        }
      },
      {
        $match: {
          mortality: {
            $lt: 0.005
          }
        }
      },
      {
        $sort: {
          state: 1
        }
      }
    ]);

    res.status(200).json({
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = app;
