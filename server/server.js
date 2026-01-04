import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // npm install node-fetch
 
const app = express();
app.use(cors());
app.use(express.json());

// GET route
app.get("/", (req, res) => {
  res.status(200).send({ message: "Server is running with local LLaMA3!" });
});
 
// POST route
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
 
    // Call local LLaMA3 API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3", // your local model name
        prompt: prompt,
        stream: false,
      }),
    });
 
    const data = await response.json();

    // Send back LLaMA3 response
    res.status(200).send({ bot: data.response });
  } catch (error) {
    console.error("Error calling local LLaMA3:", error);
    res.status(500).send({ error: error.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on Port http://localhost:3000");
});