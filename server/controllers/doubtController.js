// ============================================
// controllers/doubtController.js - WITH USER AUTH
// ============================================

const { groq } = require("../config/gemini");
const Doubt = require("../models/Doubt");
const fs = require('fs');

// ============================================
// askDoubt - Text-only doubt (with user)
// ============================================
const askDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "A question is required" });
    }

    const subjectContext = subject && subject !== "General"
      ? `This question is from the subject: ${subject}.`
      : "";

    const prompt = `You are an expert academic tutor. A student has the following doubt:

"${question}"

${subjectContext}

Please provide a thorough, student-friendly answer. Return ONLY valid JSON (no markdown) in this format:
{
  "answer": "Clear, direct answer to the question",
  "explanation": "Detailed step-by-step explanation or breakdown",
  "difficulty": "Easy | Medium | Hard",
  "tags": ["topic1", "topic2", "topic3"],
  "subject": "detected subject",
  "tips": ["helpful tip 1", "helpful tip 2"]
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    const text = response.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    const doubt = new Doubt({
      user: req.user._id,  // ADD THIS - Link to logged-in user
      question: question.trim(),
      imageUrl: null,
      subject: aiResult.subject || subject || "General",
      answer: aiResult.answer,
      explanation: aiResult.explanation || "",
      difficulty: aiResult.difficulty || "Medium",
      tags: aiResult.tags || [],
    });

    const saved = await doubt.save();

    res.status(201).json({ doubt: saved, tips: aiResult.tips || [] });
  } catch (error) {
    console.error("Ask doubt error:", error);
    res.status(500).json({ error: "Failed to process your doubt: " + error.message });
  }
};

// ============================================
// askDoubtWithImage - Image doubt (with user)
// ============================================
const askDoubtWithImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { question, subject } = req.body;
    const imagePath = req.file.path;
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype;

    const subjectText = subject && subject !== 'General' 
      ? `This is from the subject: ${subject}. ` 
      : '';

    const prompt = `You are an expert academic tutor. ${subjectText}
${question || "Please analyze this image and explain what it shows."}

Provide a clear, helpful answer.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const answer = response.choices[0].message.content;

    const doubt = new Doubt({
      user: req.user._id,  // ADD THIS - Link to logged-in user
      question: question || "Image analysis request",
      imageUrl: imageUrl,
      subject: subject || "General",
      answer: answer,
      explanation: "",
      difficulty: "Medium",
      tags: [],
    });

    const saved = await doubt.save();

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(201).json({ doubt: saved });
  } catch (error) {
    console.error("Ask doubt with image error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to process image doubt: " + error.message });
  }
};

// ============================================
// askFollowUp - Follow-up on existing doubt (verify ownership)
// ============================================
const askFollowUp = async (req, res) => {
  try {
    const { question } = req.body;
    const doubtId = req.params.id;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "A follow-up question is required" });
    }

    // Only find doubt if it belongs to the logged-in user
    const doubt = await Doubt.findOne({ _id: doubtId, user: req.user._id });
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }

    const prompt = `You are an expert academic tutor. A student previously asked:

Original question: "${doubt.question}"
Your previous answer: "${doubt.answer}"

Now the student has a follow-up question:
"${question}"

Please provide a clear and concise answer to the follow-up. Return only plain text (no JSON).`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const followUpAnswer = response.choices[0].message.content;

    doubt.followUps.push({ question, answer: followUpAnswer });
    await doubt.save();

    res.json({ question, answer: followUpAnswer });
  } catch (error) {
    console.error("Follow-up error:", error);
    res.status(500).json({ error: "Failed to process follow-up question" });
  }
};

// ============================================
// getHistory - Get ONLY logged-in user's doubts
// ============================================
const getHistory = async (req, res) => {
  try {
    const { subject, difficulty, search } = req.query;
    const filter = { user: req.user._id };  // ADD THIS - Only current user's doubts

    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.question = { $regex: search, $options: "i" };

    const doubts = await Doubt.find(filter).sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to fetch doubt history" });
  }
};

// ============================================
// getDoubtById - Get single doubt (verify ownership)
// ============================================
const getDoubtById = async (req, res) => {
  try {
    // Only find doubt if it belongs to logged-in user
    const doubt = await Doubt.findOne({ _id: req.params.id, user: req.user._id });
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }
    res.json(doubt);
  } catch (error) {
    console.error("Get doubt error:", error);
    res.status(500).json({ error: "Failed to fetch doubt" });
  }
};

// ============================================
// markHelpful - Rate answer (verify ownership)
// ============================================
const markHelpful = async (req, res) => {
  try {
    const { isHelpful } = req.body;

    if (typeof isHelpful !== "boolean") {
      return res.status(400).json({ error: "isHelpful must be true or false" });
    }

    // Only update if doubt belongs to logged-in user
    const doubt = await Doubt.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isHelpful },
      { new: true }
    );

    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }

    res.json({ message: "Feedback saved", doubt });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
};

// ============================================
// deleteDoubt - Delete doubt (verify ownership)
// ============================================
const deleteDoubt = async (req, res) => {
  try {
    // Only delete if doubt belongs to logged-in user
    const doubt = await Doubt.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doubt) {
      return res.status(404).json({ error: "Doubt not found" });
    }
    res.json({ message: "Doubt deleted successfully" });
  } catch (error) {
    console.error("Delete doubt error:", error);
    res.status(500).json({ error: "Failed to delete doubt" });
  }
};

module.exports = {
  askDoubt,
  askDoubtWithImage,
  askFollowUp,
  getHistory,
  getDoubtById,
  markHelpful,
  deleteDoubt,
};