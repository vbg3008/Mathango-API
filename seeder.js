import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import { fileURLToPath } from "url";
import Chapter from "./models/Chapter.js";



// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Read the sample data file
const sampleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./all_subjects_chapter_data.json"),
    "utf-8"
  )
);

// Load environment variables
dotenv.config();

//connect with DB
connectDB();

const transformYearWiseData = (yearDataObj) => {
  return Object.entries(yearDataObj).map(([year, count]) => ({
    year: Number(year),
    questionCount: count,
  }));
};

const addAllData = async () => {
  try {
    await Chapter.deleteMany(); // Optional: Clear existing data
    const formattedData = sampleData.map((item) => ({
      subject: item.subject,
      chapter: item.chapter,
      class: item.class,
      unit: item.unit,
      yearWiseQuestionCount: transformYearWiseData(item.yearWiseQuestionCount),
      questionSolved: item.questionSolved,
      status: item.status,
      isWeakChapter: item.isWeakChapter,
    }));

    await Chapter.insertMany(formattedData);
    console.log("All data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error inserting data:", err);
    process.exit(1);
  }
};

addAllData();
