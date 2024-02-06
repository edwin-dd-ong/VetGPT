import OpenAI from "openai";
import express from "express";
import cors from "cors";
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({ apiKey: process.env['openai_api_key']  });
const pc = new Pinecone({
  apiKey: process.env['pinecone_api_key'] 
});
const index = pc.index('vet-papers');

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
      console.log(embedding.data[0].embedding);
      return embedding.data[0].embedding;
    };

    async function query_pc_db() {
    // Query pinecone vectorDB for nearest 5 vectors
        let pc_result = await index.namespace('ns1').query({
           topK: 5,
           vector: await get_query_embedding(),
           includeMetadata: true,
        });
    // Extract metadata from nearest 5 neighbors
       return (pc_result.matches).map((match) =>  " Title: " + match.metadata["paper"] + ". Text: " + match.metadata["text"]);
    }
    
    // Combine with user query and call openAI chat completion endpoint
    async function get_bot_response() {
      const extract = (a, b, c, d, e) => a + " " + b + " " + c + " " + d + " " + e 
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant. Please make sure your answers are drawn from the following text, and cite the titles:" },
          { role: "system", content: extract(...(await query_pc_db()))},
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
