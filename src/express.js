
const express = require("express");

// --- Import Routes ---
const calculateCarValue = require("./carValue");
const carValueRoutes = require("./routes/carValueRoutes");
const discountRoute = require("./routes/discountRoute"); 
const premiumQuoteRoutes = require("./routes/premiumQuoteRoutes");

const app = express();

// --- Core Middleware ---
app.use(express.json());
app.use(express.json());

app.use("/api/v1", carValueRoutes);
app.use("/api/v1", discountRoute);
app.use("/api/v1/quote", premiumQuoteRoutes);

//========== ROUTES ==========//

app.post("/api/v1/calculate-car-value", (req, res) => {
  const { carModel, year } = req.body;

  if (!carModel || !year) {
    return res.status(400).send({ error: "Car model and year are required" });
  }

  try {
    const carValue = calculateCarValue(carModel, year);
    return res.status(200).send({ car_value: carValue });
  } catch (error) {
    console.error("Error processing car value:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
});

// Define other routes
app.use(carValueRoutes);
app.use("/api/v1", discountRoute);
app.use("/api/v1/quote", premiumQuoteRoutes);

app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ error: "Not Found" });
  } else {
    next();
  }
});

// --- Global Error Handling Middleware ---

app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err);

  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app instance for use in other files
module.exports = app;