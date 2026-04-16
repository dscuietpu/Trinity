const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Moderation Service
 * 
 * Uses Gemini to analyze user-generated content for safety, spam, and relevance.
 * Designed to be modular and synchronous.
 */

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

/**
 * Analyzes content and returns a structured moderation decision.
 * 
 * @param {string} text - The content to moderate
 * @returns {Promise<{allowed: boolean, category: string, reason: string}>}
 */
const moderateContent = async (text) => {
  // If API Key is missing, log a warning and allow the content (Fail-open for UX)
  if (!genAI || !model) {
    console.warn("[MODERATION] Gemini API Key is missing. Moderation layer is inactive.");
    return {
      allowed: true,
      category: "safe",
      reason: "Moderation system not configured."
    };
  }

  if (!text || text.trim().length < 2) {
    return { allowed: true, category: "safe", reason: "Content too short to analyze." };
  }

  try {
    const prompt = `
      You are a content moderator for "RaiseIt", a community reporting platform for college/local issues.
      Analyze the text below for:
      - Spam (commercial ads, repetitive junk)
      - Hate speech or harassment
      - Explicit sexual content
      - Abuse or violence
      - Completely irrelevant content (non-issue related gibberish)

      Rules:
      - Only block clear violations.
      - Be lenient with casual language or minor off-topic remarks.
      - Return ONLY a JSON object with this structure:
      {
        "allowed": boolean,
        "category": "safe|spam|hate|harassment|sexual|abuse|other",
        "reason": "short explanation in 10 words or less"
      }

      Content to analyze:
      "${text.substring(0, 2000)}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Clean potential markdown formatting from AI response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const decision = JSON.parse(jsonMatch[0]);
    
    console.log(`[MODERATION] Decision for "${text.substring(0, 30)}...":`, decision);
    
    return {
      allowed: decision.allowed ?? true,
      category: decision.category ?? "other",
      reason: decision.reason ?? ""
    };

  } catch (error) {
    console.error("[MODERATION] API Error:", error.message);
    // Graceful fallback: allow content on technical errors to not block users
    return {
      allowed: true,
      category: "safe",
      reason: "Moderation service temporarily unavailable."
    };
  }
};

module.exports = { moderateContent };
