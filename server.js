import OpenAI from "openai";
import express from "express";
import cors from "cors";

const openai = new OpenAI({ apiKey: process.env['openai_api_key']  });


const app = express();
const port = 3000; // Choose a port for your server
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// Define a route that makes a call to the OpenAI API
app.post('/query', async (req, res) => {
  try {
    const text = req.body.message;
   

    // Make a call to the OpenAI API and get the query embedding

    async function get_query_embedding() {
      let embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      })
      return embedding.data[0].embedding;
    };

    // Query pinecone vectorDB for nearest 5 vectors

    // Extract metadata from nearest 5 neighbors

    // Combine with user query and call openAI chat completion endpoint

    async function get_bot_response() {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          // need to add in previous messages
          ...req.body.messageList,
          { role: "user", content: text}
          
        ],
        model: "gpt-3.5-turbo",
      });
      return completion.choices[0].message.content
    }

    const bot_response = await get_bot_response();
    res.send(bot_response);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
