import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";

export function createAiGatewayProvider() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (geminiKey) {
    return {
      model: createOpenAICompatible({
        name: "google-gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: geminiKey,
      })("gemini-2.5-flash"),
      hasKey: true,
    };
  }

  if (lovableKey) {
    return {
      model: createOpenAICompatible({
        name: "lovable-gateway",
        baseURL: BASE_URL,
        apiKey: lovableKey,
      })("google/gemini-2.5-flash"),
      hasKey: true,
    };
  }

  return {
    model: null,
    hasKey: false,
  };
}

export function createLovableAiGatewayProvider(apiKey: string) {
  const provider = createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: BASE_URL,
    apiKey,
  });

  return provider;
}
