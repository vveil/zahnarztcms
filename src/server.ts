import express from "express";
import payload from "payload";
import cors from "cors";

require("dotenv").config();
const app = express();

const corsOptions = {
  origin: ["https://zahnarzt.niklas.ai", "http://localhost:3000", "https://dr-werner-zahnarzt.de"],
  // optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Add your own express routes here

  app.listen(3010);
};

start();
