import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "25mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const categoryPrompts = {
  Professional:
    "Create a polished professional photograph suitable for a premium corporate profile. Preserve the person's identity and natural facial structure.",

  Editorial:
    "Create a sophisticated high-end editorial photograph with refined lighting, premium color grading and realistic skin texture.",

  Cinematic:
    "Create a cinematic professional photograph with controlled contrast, atmospheric lighting and elegant color grading.",

  Portrait:
    "Enhance the portrait with professional DSLR-style lighting, realistic depth of field and natural skin texture.",

  "Skin Retouch":
    "Perform subtle professional skin retouching. Reduce temporary imperfections, redness and excessive shine while preserving pores, beard detail and authentic skin texture.",

  "Body Shape":
    "Make subtle, realistic improvements to the body's silhouette while preserving identity, anatomy, natural proportions and clothing details. Do not over-edit.",

  Background:
    "Improve or replace the background with a clean professional environment while preserving the person accurately.",

  Color:
    "Apply professional color correction, white balance, tonal balancing and refined cinematic color grading.",

  "Black & White":
    "Convert the photograph into a sophisticated high-end black and white portrait with rich tonal range and detailed highlights and shadows."
};

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Photo Studio Pro"
  });
});

app.post("/api/edit", async (req, res) => {
  try {
    const { image, category, prompt } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "No image provided."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }

    const categoryInstruction =
      categoryPrompts[category] ||
      categoryPrompts.Professional;

    const finalPrompt = `
You are a world-class professional photographer and senior photo retoucher.

${categoryInstruction}

Additional user instructions:
${prompt || "Apply the selected professional editing style."}

Important requirements:
- Preserve the subject's identity.
- Preserve realistic anatomy and proportions.
- Preserve facial structure and expression.
- Do not create an artificial or plastic appearance.
- Maintain realistic skin texture.
- Preserve important clothing and environmental details.
- Make the result look like a professionally photographed and professionally retouched image.
`;

    const response = await client.images.edit({
      model: "gpt-image-1",
      image: image,
      prompt: finalPrompt,
      size: "auto"
    });

    const imageData = response.data?.[0]?.b64_json;

    if (!imageData) {
      throw new Error("No image was returned by the AI service.");
    }

    res.json({
      image: `data:image/png;base64,${imageData}`
    });
  } catch (error) {
    console.error("AI editing error:", error);

    res.status(500).json({
      error:
        error?.message ||
        "An unexpected error occurred while editing the image."
    });
  }
});

const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Photo Studio Pro running on port ${PORT}`);
});
