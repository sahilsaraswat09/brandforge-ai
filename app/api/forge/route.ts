import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensure Gemini API key is securely accessed server-side only
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Multi-tier model instances for high resilience against 503 high-demand spikes
const primaryModel = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
const fallbackModel1 = genAI.getGenerativeModel({ model: "gemini-3.7-flash" });
const fallbackModel2 = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
const fallbackModel3 = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

// Priority array mapping each model name to its respective instance and retry attempt limit
const models = [
  { name: "gemini-3.8-flash", model: primaryModel, maxAttempts: 3 },
  { name: "gemini-3.7-flash", model: fallbackModel1, maxAttempts: 2 },
  { name: "gemini-3.6-flash", model: fallbackModel2, maxAttempts: 2 },
  { name: "gemini-3.5-flash-lite", model: fallbackModel3, maxAttempts: 2 },
];

/**
 * Checks if an error is a temporary/transient API error eligible for retry and model fallback.
 */
function isTransientError(error: any): boolean {
  const status = error?.status || error?.response?.status;
  const message = (error?.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    status === 504 ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("429") ||
    message.includes("504") ||
    message.includes("overloaded") ||
    message.includes("service unavailable") ||
    message.includes("high demand")
  );
}

/**
 * Helper function executing a prompt across the multi-tier fallback model chain with timing instrumentation.
 */
async function generateWithRetry(
  prompt: string,
  stageName: string
): Promise<any> {
  const startTime = Date.now();

  for (let i = 0; i < models.length; i++) {
    const { name, model, maxAttempts } = models[i];

    if (i > 0) {
      console.log(`[BrandForge] ${stageName} → Switching to ${name}`);
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[BrandForge] ${stageName} → ${name}`);

      try {
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const cleanedText = text.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanedText);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[BrandForge] ${stageName} completed in ${duration}s (${name})`);
        return parsedData;

      } catch (error: any) {
        const transient = isTransientError(error);

        // Fail fast on permanent errors
        if (!transient) {
          console.error(`[BrandForge] ${stageName} → Non-transient error on ${name}: ${error?.message}`);
          throw error;
        }

        if (attempt < maxAttempts) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.warn(`[BrandForge] ${stageName} → Retry ${attempt}/${maxAttempts}`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else {
          console.warn(`[BrandForge] ${stageName} → ${name} unavailable`);
        }
      }
    }
  }

  throw new Error(`All Gemini models failed for ${stageName}.`);
}

export async function POST(req: Request) {
  const pipelineStartTime = Date.now();

  try {
    const body = await req.json();
    const idea = body?.idea;

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json({ error: "Please provide a valid startup idea." }, { status: 400 });
    }

    // =========================================================================
    // STAGE 1: DISCOVER
    // Dependencies: Raw Idea
    // =========================================================================
    const prompt1 = `Analyze idea: "${idea}". Return concise JSON with keys: "problem" (1 sentence), "audience" (short phrase), "constraints" (1 sentence). No markdown.`;
    const stage1 = await generateWithRetry(prompt1, "Stage 1: Discover");

    // =========================================================================
    // STAGE 2: POSITION
    // Dependencies: Stage 1
    // =========================================================================
    const prompt2 = `Strategy for: ${JSON.stringify(stage1)}. Return concise JSON with keys: "category" (short), "valueProposition" (1 sentence), "usp" (1 sentence). No markdown.`;
    const stage2 = await generateWithRetry(prompt2, "Stage 2: Position");

    // =========================================================================
    // STAGE 3: SHAPE (BRAND IDENTITY)
    // Dependencies: Stage 2
    // =========================================================================
    const prompt3 = `Identity for: ${JSON.stringify(stage2)}. Return concise JSON with keys: "brandName" (1-2 words), "tagline" (catchy), "personalityTraits" (array of 3 short words), "brandVoice" (1 sentence). No markdown.`;
    const stage3 = await generateWithRetry(prompt3, "Stage 3: Shape");

    // =========================================================================
    // PARALLEL EXECUTION OPTIMIZATION:
    // - Stage 4 (Visualize) depends on Stage 3.
    // - Stage 6 (Deliver) ONLY depends on Stage 3 (does NOT depend on Stage 4 or 5).
    // Stage 6 can run concurrently alongside Stage 4 + Stage 5!
    // =========================================================================

    // Branch A: Stage 4 -> Stage 5 (Sequential dependency chain)
    const runStage4And5 = async () => {
      // STAGE 4: VISUALIZE
      const prompt4 = `Visual brief for brand "${stage3.brandName}". Return concise JSON with keys: "primaryColorHex" (hex string), "secondaryColorHex" (hex string), "typography" (font pairing name), "logoConcept" (1 sentence). No markdown.`;
      const stage4Data = await generateWithRetry(prompt4, "Stage 4: Visualize");

      // STAGE 5: CHALLENGE (ANTI-GENERIC AI CRITIC)
      const prompt5 = `Audit brand: ${JSON.stringify({ ...stage3, ...stage4Data })}. Return concise JSON with keys: "detectedCliches" (array of 2-3 cliches), "revisedTagline" (1 punchy line), "consistencyScore" (number 80-98), "criticFeedback" (1-2 concise sentences). No markdown.`;
      const stage5Data = await generateWithRetry(prompt5, "Stage 5: Anti-Generic AI Critic");

      return { stage4: stage4Data, stage5: stage5Data };
    };

    // Branch B: Stage 6 (Deliver) - runs in parallel with Branch A
    const runStage6 = async () => {
      const prompt6 = `Launch copy for "${stage3.brandName}". Return concise JSON with keys: "landingPageHeadline" (punchy headline), "socialLaunchPost" (2-sentence post). No markdown.`;
      return await generateWithRetry(prompt6, "Stage 6: Deliver");
    };

    // Execute Branch A and Branch B concurrently using Promise.all
    const [{ stage4, stage5 }, stage6] = await Promise.all([
      runStage4And5(),
      runStage6(),
    ]);

    const totalPipelineDuration = ((Date.now() - pipelineStartTime) / 1000).toFixed(2);
    console.log(`[BrandForge] Total pipeline time: ${totalPipelineDuration}s`);

    // Return exact response JSON structure expected by app/page.tsx
    return NextResponse.json({
      discover: stage1,
      position: stage2,
      shape: stage3,
      visualize: stage4,
      critic: stage5,
      deliver: stage6,
    });

  } catch (error: any) {
    console.error("[BrandForge Pipeline Error]:", error);

    return NextResponse.json(
      { error: "AI is temporarily busy. Please try again in a few seconds." },
      { status: 503 }
    );
  }
}