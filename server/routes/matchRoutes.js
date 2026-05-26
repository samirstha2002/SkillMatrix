import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { findLearners, findTeachers } from "../controller/matchController.js";

const router = express.Router();

//protected search routes

router.get("/teachers", authMiddleware, findTeachers);
router.get("/learners", authMiddleware, findLearners);

export default router;
