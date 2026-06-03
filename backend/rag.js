import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let knowledgeChunks = [];
let isInitialized = false;

// Keyword-based search
function keywordSearch(query, chunks, limit = 3) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = chunks.map(chunk => {
    let score = 0;
    const searchContent = `${chunk.title} ${chunk.content} ${chunk.category}`.toLowerCase();
    
    queryWords.forEach(word => {
      if (searchContent.includes(word)) {
        score += 1;
        // Boost title matches
        if (chunk.title.toLowerCase().includes(word)) score += 2;
        // Boost category matches
        if (chunk.category.toLowerCase().includes(word)) score += 1.5;
      }
    });
    return { ...chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Load knowledge base
export async function initializeRAG() {
  try {
    const kbPath = path.join(__dirname, 'knowledge_base.json');
    if (!fs.existsSync(kbPath)) {
      console.error("Knowledge base file not found at:", kbPath);
      return;
    }

    const data = fs.readFileSync(kbPath, 'utf-8');
    knowledgeChunks = JSON.parse(data);
    console.log(`Loaded ${knowledgeChunks.length} knowledge chunks for local RAG.`);
    isInitialized = true;
  } catch (error) {
    console.error("Error initializing RAG:", error);
    isInitialized = true;
  }
}

// Retrieve relevant chunks for a user query
export async function retrieveContext(query, limit = 3) {
  if (!isInitialized) {
    await initializeRAG();
  }
  return keywordSearch(query, knowledgeChunks, limit);
}

// Generate Chat Response locally (no OpenAI call)
export async function generateChatResponse(query, userProfile = {}, history = []) {
  const contextChunks = await retrieveContext(query);
  return generateOfflineResponse(query, contextChunks, userProfile);
}

// Generate high-quality structured responses based on matched knowledge
function generateOfflineResponse(query, matchedChunks, userProfile) {
  const q = query.toLowerCase();
  
  let profileContext = "";
  if (userProfile.name) {
    profileContext = ` For **${userProfile.name}** (Goal: **${userProfile.goal || 'General Fitness'}**, Activity: **${userProfile.activity_level || 'Moderate'}**), `;
  }

  let text = `👋 Hello! I am FitBot, your AI fitness & diet coach.${profileContext}Here is what our verified health database recommends for your query:\n\n`;

  if (matchedChunks && matchedChunks.length > 0 && matchedChunks[0].score > 0) {
    matchedChunks.forEach((chunk, idx) => {
      text += `### ${idx + 1}. ${chunk.title}\n${chunk.content}\n\n`;
    });
  } else {
    // If no direct matches, return general high-quality guidelines based on categories
    text += `To give you the best advice, here are our standard guidelines:\n\n`;
    text += `### 🏋️ General Workout Recommendations\nAim for 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening exercises at least 2 days a week.\n\n`;
    text += `### 🥗 Nutrition & Diet Guidelines\nFocus on whole foods, lean proteins, vegetables, and complex carbohydrates. Keep processed sugars and saturated fats to a minimum.\n\n`;
    text += `### 💧 Hydration & Recovery\nDrink at least 2-3 liters of water daily. Ensure 7-9 hours of restful sleep every night to support muscle repair and metabolic regulation.\n\n`;
  }

  // Calculate customized recommendations if we have profile data
  if (userProfile.height && userProfile.weight) {
    const heightM = userProfile.height / 100;
    const bmi = (userProfile.weight / (heightM * heightM)).toFixed(1);
    let classif = "";
    if (bmi < 18.5) classif = "Underweight";
    else if (bmi < 25) classif = "Normal Weight";
    else if (bmi < 30) classif = "Overweight";
    else classif = "Obese";

    text += `\n**Your Bio-Metrics:**\n`;
    text += `- **Current BMI**: ${bmi} (${classif})\n`;
    text += `- **Activity Level**: ${userProfile.activity_level || 'Moderate'}\n`;
    text += `- **Caloric Guideline**: ${userProfile.goal === 'Weight Loss' ? '1,800 kcal (Deficit)' : userProfile.goal === 'Weight Gain' ? '2,800 kcal (Surplus)' : '2,200 kcal (Maintenance)'}\n`;
  }

  text += `\n*Note: Always consult a certified healthcare professional before starting any major diet or training program.*`;
  return text;
}
