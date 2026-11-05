
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api", (req, res) => {
  res.json({
    message: "FIFA AI PREDICTOR fonctionne !",
    version: "1.0"
  });
});

app.post("/predict", (req, res) => {
  const { goalsHome, goalsAway, matches } = req.body;

  if (
    !Array.isArray(matches) ||
    matches.length < 3 ||
    !matches.every(m =>
      Number.isFinite(m.home) &&
      Number.isFinite(m.away) &&
      m.home >= 0 &&
      m.away >= 0
    )
  ) {
    return res.status(400).json({
      error: "Entre au moins 3 résultats valides."
    });
  }

  const totalGoals = matches.map(m => m.home + m.away);
  const average =
    totalGoals.reduce((a, b) => a + b, 0) / totalGoals.length;

  const overCount = totalGoals.filter(g => g >= 6).length;
  const overRate = overCount / totalGoals.length;

  const prediction = Math.round(
    (overRate * 0.7 + (average >= 6 ? 0.3 : 0)) * 100
  );

  res.json({
    averageGoals: Number(average.toFixed(2)),
    over55HistoricalRate: Math.round(overRate * 100),
    estimatedOver55: prediction,
    recommendation:
      prediction >= 65 ? "OVER 5.5 à surveiller" :
      prediction >= 45 ? "PRUDENCE" : "UNDER 5.5 à surveiller",
    note: "Estimation statistique, pas une garantie."
  });
});

app.listen(PORT, () => {
  console.log(`FIFA AI PREDICTOR lancé sur le port ${PORT}`);
});
