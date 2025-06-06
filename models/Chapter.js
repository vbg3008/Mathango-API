// models/Chapter.js
import mongoose from "mongoose";

const yearDataSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  questionCount: { type: Number, default: 0 }
}, { _id: false }); 

const chapterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  class: { type: String, required: true },
  unit: { type: String, required: true },
  yearWiseQuestionCount: {
    type: [yearDataSchema], 
    required: true
  },
  questionSolved: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  isWeakChapter: { type: Boolean, default: false }
});

export default mongoose.model("Chapter", chapterSchema);
