import express from "express";
import multer from "multer";
import {
  getAllChapters,
  uploadChapters,
  getChapterById
} from "../controllers/chapterController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllChapters);
router.post("/", upload.single("file"), uploadChapters);
router.get("/:id", getChapterById);

export default router;