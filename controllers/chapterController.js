import Chapter from "../models/Chapter.js";
import { redisClient } from "../utils/redisConfig.js";

const isAdmin = true;

const getCacheKey = (query) => {
  return `chapters:${JSON.stringify(query)}`;
};

const invalidateChapterCache = async () => {
  try {
    const keys = await redisClient.keys("chapters:*");
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`Invalidated ${keys.length} cache entries`);
    }
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
};

export const getAllChapters = async (req, res) => {
  try {
    const {
      class: className,
      unit,
      status,
      weakChapters,
      subject,
      page = 1,
      limit = 10,
    } = req.query;

    if (
      !className &&
      !unit &&
      !status &&
      !subject &&
      weakChapters === undefined &&
      page == 1 &&
      limit == 10
    ) {
      const chapters = await Chapter.find({});
      const chapterNames = chapters.map((item) => item.chapter);
      return res.status(200).json({
        total: chapterNames.length,
        chapters: chapterNames,
      });
    }

    const query = {};
    if (className) query.class = className;
    if (unit) query.unit = unit;
    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (weakChapters !== undefined)
      query.weakChapters = weakChapters === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const redisKey = getCacheKey({ ...query, page, limit });

    const cacheData = await redisClient.get(redisKey);
    if (cacheData) {
      return res.status(200).json(JSON.parse(cacheData));
    }

    const [chapters, total] = await Promise.all([
      Chapter.find(query).skip(skip).limit(parseInt(limit)),
      Chapter.countDocuments(query),
    ]);

    const response = {
      success: true,
      totalChapters: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      chapters,
    };

    await redisClient.setEx(redisKey, 3600, JSON.stringify(response));
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadChapters = async (req, res) => {
  try {
    if (!isAdmin) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only admin can upload chapters",
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    let chapData;
    try {
      chapData = JSON.parse(req.file.buffer.toString("utf-8"));
      if (!Array.isArray(chapData)) {
        return res.status(400).json({ error: "JSON must be an array of chapters" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON file" });
    }
    const failedUploads = [];
    const validChapters = [];
    for (const chapter of chapData) {
      try {
        const newChap = new Chapter(chapter);
        await newChap.validate();
        validChapters.push(newChap);
      } catch (validationError) {
        failedUploads.push({
          chapter,
          error: validationError.message,
        });
      }
    }
    try {
      if (validChapters.length > 0) {
        await Chapter.insertMany(validChapters);
        await invalidateChapterCache();
      }
      res.status(207).json({
        message: "Upload completed",
        insertedCount: validChapters.length,
        failedUploads,
      });
    } catch (insertError) {
      return res.status(500).json({
        error: "Error inserting chapters",
        details: insertError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error while uploading chapters",
      error: error.message,
    });
  }
};

export const getChapterById = async (req, res) => {
  try {
    const cacheKey = `chapter:${req.params.id}`;
    const cachedChapter = await redisClient.get(cacheKey);
    if (cachedChapter) {
      return res.status(200).json(JSON.parse(cachedChapter));
    }
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(chapter));
    res.status(200).json(chapter);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid chapter ID format" });
    }
    res.status(500).json({ message: "Server error while fetching chapter" });
  }
};