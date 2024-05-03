import express from "express";
import cors from "cors";
import axios from "axios"; // Import axios to make HTTP requests
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Ensure you can handle large payloads

app.post("/describe-image", async (req, res) => {
  const base64Image = req.body.image; // Get the base64 image data from the request

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure your API key is correctly set in .env file
  };

  const payload = {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe what is in this image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  try {
    // Make the API call to OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      { headers }
    );
    res.json(response.data); // Send the response from OpenAI back to the client
    console.log(`Using API Key: ${process.env.OPENAI_API_KEY}`); // This will show you what API key is being used
  } catch (error) {
    console.error("Failed to call OpenAI API:", error);
    console.log(`Using API Key: ${process.env.OPENAI_API_KEY}`); // This will show you what API key is being used

    if (error instanceof Error) {
      // Now we know `error` is of type Error, and we can access `message` safely
      res.status(500).json({ error: error.message });
    } else {
      // If it's not an Error, just send a generic message
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
