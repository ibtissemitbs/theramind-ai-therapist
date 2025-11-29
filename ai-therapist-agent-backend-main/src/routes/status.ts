import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/status", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusMap: { [key: number]: string } = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    server: "running",
    mongodb: {
      status: statusMap[mongoStatus] || "unknown",
      readyState: mongoStatus,
      connected: mongoStatus === 1,
    },
    environment: process.env.NODE_ENV,
  });
});

export default router;
