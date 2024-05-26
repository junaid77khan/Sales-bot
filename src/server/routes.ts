import * as express from "express";
import { readData } from "./connection";
import * as dotenv from "dotenv";
import OpenAI from "openai";
const router = express.Router();
dotenv.config();

const database = "inventory";

router.get("/api/hello", (req, res, next) => {
  res.json("SingleStore");
});

router.get(`/api/database/:text`, async (req, res) => {
  const text = req.params.text;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    const sqlRes = await readData({
      database,
      embedding,
    });
    const prompt = `The user marked that they were interested in ${text}. The most similar item from the inventory of items is ${sqlRes}.please recommend this to the user and only this item `;
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are helpful assistant",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      model:"gpt-3.5-turbo",
    });
    // res.json(completion.data.choices[0].message.content);
    console.log(completion.choices[0].message.content)
  } catch (err) {
    console.error(err);
  }
});
export default router;
