import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './db.js';
import { initializeRAG, generateChatResponse } from './rag.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const BMI_FILE = path.join(DATA_DIR, 'bmi_records.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON safely
function readLocalData(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading local file ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON safely
function writeLocalData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing local file ${filePath}:`, err);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({ origin: '*' }));
app.use(express.json());

// List of rotating daily health tips
const DAILY_TIPS = [
  { id: 1, title: "Stay Hydrated", content: "Drinking water before meals can help boost metabolism and promote satiety. Aim for at least 8-10 glasses a day!" },
  { id: 2, title: "Prioritize Sleep", content: "Get 7-9 hours of quality sleep. Muscle fibers tear down when you exercise, but they repair and grow when you sleep." },
  { id: 3, title: "Stand Up and Move", content: "For every hour of sitting, stand up and walk around for 2 minutes. It improves blood circulation and helps posture." },
  { id: 4, title: "Include Protein in Every Meal", content: "Eating protein helps with muscle recovery, keeps you feeling full longer, and has a higher thermic effect than fats or carbs." },
  { id: 5, title: "Perfect Your Form First", content: "In strength training, proper form always beats heavy weight. It prevents injury and ensures the target muscles do the work." },
  { id: 6, title: "Eat the Rainbow", content: "Incorporate vegetables of different colors in your meals. This ensures you get a wide spectrum of vitamins, minerals, and antioxidants." },
  { id: 7, title: "Active Recovery", content: "On rest days, do a low-intensity activity like walking, yoga, or stretching. It keeps joints mobile and promotes faster healing." }
];

// Initialize RAG on startup
initializeRAG().then(() => {
  console.log("RAG system initialized successfully.");
});

// ─── API Routes ─────────────────────────────────────────────────

// Get daily tips
app.get('/api/tips/daily', (req, res) => {
  const dayIndex = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
  const tip = DAILY_TIPS[dayIndex % DAILY_TIPS.length];
  return res.json(tip);
});

// Calculate and save BMI
app.post('/api/bmi', async (req, res) => {
  const { weight, height, user_id } = req.body;

  if (!weight || !height || !user_id) {
    return res.status(400).json({ error: "Weight (kg), height (cm), and user_id are required" });
  }

  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(2));
  
  let classification = "";
  let advice = "";

  if (bmi < 18.5) {
    classification = "Underweight";
    advice = "Your BMI indicates you are underweight. Consider speaking with a doctor or dietitian. To gain weight healthily, focus on nutrient-dense foods, lean protein, and resistance training to build muscle.";
  } else if (bmi < 25) {
    classification = "Normal Weight";
    advice = "Great job! Your BMI falls into the healthy weight range. Maintain your active lifestyle, stay hydrated, and consume a balanced diet rich in whole foods.";
  } else if (bmi < 30) {
    classification = "Overweight";
    advice = "Your BMI indicates you are in the overweight category. Combining a slight caloric deficit with regular cardiovascular exercise and strength training can help improve your body composition.";
  } else {
    classification = "Obese";
    advice = "Your BMI falls in the obese category. We recommend consulting a healthcare provider to create a safe, sustainable plan. Start with low-impact exercises (like walking or swimming) and focus on nutrition.";
  }

  const record = {
    user_id,
    weight: parseFloat(weight),
    height: parseFloat(height),
    bmi,
    classification,
    created_at: new Date().toISOString()
  };

  // Attempt to save to Supabase
  try {
    const { data, error } = await supabase
      .from('bmi_records')
      .insert(record)
      .select();

    if (error) throw error;
    console.log("BMI record saved to Supabase.");

    // Sync to local backup
    const localBmi = readLocalData(BMI_FILE, []);
    localBmi.unshift(data[0]);
    writeLocalData(BMI_FILE, localBmi);

    return res.json({ status: "success", record: data[0], advice });
  } catch (err) {
    console.warn("Supabase save failed, falling back to local file backup:", err.message);
    
    // Save to local file
    const localBmi = readLocalData(BMI_FILE, []);
    const fallbackRecord = { ...record, id: "temp-" + Date.now() };
    localBmi.unshift(fallbackRecord);
    writeLocalData(BMI_FILE, localBmi);

    return res.json({ 
      status: "fallback_success", 
      record: fallbackRecord, 
      advice,
      message: "Saved locally (Supabase tables not configured)"
    });
  }
});

// Get BMI history
app.get('/api/bmi/history', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const { data, error } = await supabase
      .from('bmi_records')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sync local file with database
    if (data && data.length > 0) {
      writeLocalData(BMI_FILE, data);
    }
    return res.json(data || []);
  } catch (err) {
    console.warn("Could not fetch BMI history from Supabase, using local file backup:", err.message);
    const localBmi = readLocalData(BMI_FILE, []);
    const userBmi = localBmi.filter(r => r.user_id === user_id);
    return res.json(userBmi);
  }
});

// Update or create profile
app.post('/api/profile', async (req, res) => {
  const { user_id, name, age, gender, height, weight, activity_level, goal } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const profile = {
    user_id,
    name,
    age: age ? parseInt(age) : null,
    gender,
    height: height ? parseFloat(height) : null,
    weight: weight ? parseFloat(weight) : null,
    activity_level,
    goal,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('fitness_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    console.log("Profile updated in Supabase.");

    // Sync to local backup
    const localProfiles = readLocalData(PROFILE_FILE, {});
    localProfiles[user_id] = data[0];
    writeLocalData(PROFILE_FILE, localProfiles);

    return res.json({ status: "success", profile: data[0] });
  } catch (err) {
    console.warn("Could not save profile to Supabase, using local file backup:", err.message);
    
    const localProfiles = readLocalData(PROFILE_FILE, {});
    localProfiles[user_id] = profile;
    writeLocalData(PROFILE_FILE, localProfiles);

    return res.json({
      status: "fallback_success",
      profile,
      message: "Profile saved locally in session state"
    });
  }
});

// Get profile
app.get('/api/profile', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const { data, error } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for 'no rows returned'
    
    if (data) {
      // Sync local backup
      const localProfiles = readLocalData(PROFILE_FILE, {});
      localProfiles[user_id] = data;
      writeLocalData(PROFILE_FILE, localProfiles);
      return res.json(data);
    }
    
    // Check local file backup
    const localProfiles = readLocalData(PROFILE_FILE, {});
    return res.json(localProfiles[user_id] || null);
  } catch (err) {
    console.warn("Could not fetch profile from Supabase, checking local backup:", err.message);
    const localProfiles = readLocalData(PROFILE_FILE, {});
    return res.json(localProfiles[user_id] || null);
  }
});

// Chatbot RAG endpoint
app.post('/api/chat', async (req, res) => {
  const { message, user_id, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // 1. Fetch user profile context for AI customization
    let userProfile = {};
    if (user_id) {
      try {
        const { data } = await supabase
          .from('fitness_profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();
        if (data) {
          userProfile = data;
        } else {
          // Fallback to local profile file
          const localProfiles = readLocalData(PROFILE_FILE, {});
          if (localProfiles[user_id]) userProfile = localProfiles[user_id];
        }
      } catch (err) {
        console.warn("Failed to fetch user profile for chat customization, checking local backup:", err.message);
        const localProfiles = readLocalData(PROFILE_FILE, {});
        if (localProfiles[user_id]) userProfile = localProfiles[user_id];
      }
    }

    // 2. Generate Chat response via RAG
    const aiResponse = await generateChatResponse(message, userProfile, history || []);

    // 3. Log chat history
    const chatRecord = {
      user_id: user_id || 'user-default',
      message,
      response: aiResponse,
      created_at: new Date().toISOString()
    };

    // Save to local file backup
    const uid = user_id || 'user-default';
    const localChats = readLocalData(CHATS_FILE, []);
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: "temp-" + Date.now(),
      user_id: uid,
      sender: 'user',
      text: message,
      time: timeStr,
      created_at: chatRecord.created_at
    };
    const botMsg = {
      id: "temp-bot-" + Date.now(),
      user_id: uid,
      sender: 'bot',
      text: aiResponse,
      time: timeStr,
      created_at: chatRecord.created_at
    };
    localChats.push(userMsg, botMsg);
    writeLocalData(CHATS_FILE, localChats);

    if (user_id) {
      try {
        await supabase.from('chats').insert(chatRecord);
      } catch (err) {
        console.warn("Could not save chat message to Supabase logs:", err.message);
      }
    }

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get Chat history
app.get('/api/chat/history', async (req, res) => {
  const { user_id } = req.query;
  const uid = user_id || 'user-default';

  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convert Supabase schema into standard message structures for frontend
    const history = [];
    data.forEach(chat => {
      const timeStr = new Date(chat.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      history.push({
        id: chat.id + '-user',
        sender: 'user',
        text: chat.message,
        time: timeStr
      });
      history.push({
        id: chat.id + '-bot',
        sender: 'bot',
        text: chat.response,
        time: timeStr
      });
    });

    // Sync local file with DB
    writeLocalData(CHATS_FILE, data.flatMap(chat => {
      const timeStr = new Date(chat.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return [
        { id: chat.id + '-user', user_id: uid, sender: 'user', text: chat.message, time: timeStr, created_at: chat.created_at },
        { id: chat.id + '-bot', user_id: uid, sender: 'bot', text: chat.response, time: timeStr, created_at: chat.created_at }
      ];
    }));

    return res.json(history);
  } catch (err) {
    console.warn("Could not fetch chat history from Supabase, using local file backup:", err.message);
    const localChats = readLocalData(CHATS_FILE, []);
    const filteredChats = localChats.filter(chat => chat.user_id === uid).map(({ id, sender, text, time }) => ({ id, sender, text, time }));
    return res.json(filteredChats);
  }
});

// Clear Chat history
app.delete('/api/chat/history', async (req, res) => {
  const { user_id } = req.query;
  const uid = user_id || 'user-default';

  // Clear local file history for this user
  const localChats = readLocalData(CHATS_FILE, []);
  const updatedChats = localChats.filter(chat => chat.user_id !== uid);
  writeLocalData(CHATS_FILE, updatedChats);

  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', uid);

    if (error) throw error;
    return res.json({ status: "success", message: "Chat history cleared successfully" });
  } catch (err) {
    console.warn("Could not clear chat history from Supabase:", err.message);
    return res.json({ status: "fallback_success", message: "Local session chat history cleared" });
  }
});

// App health check
app.get('/', (req, res) => {
  res.json({ message: "Fitness & Diet Chatbot API is running", status: "ok" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
