import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";

export function createLovableAiGatewayProvider(apiKey: string) {
  const provider = createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: BASE_URL,
    apiKey,
  });

  return provider;
}
