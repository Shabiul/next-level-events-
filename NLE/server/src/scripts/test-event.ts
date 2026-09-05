import { eventExtractorService } from "../ai/services/event-extractor.service";

async function main() {
  const event = await eventExtractorService.extract(
    `
User: I want birthday decorations
Assistant: Sure! What's your budget?
`,
    "My budget is ₹5000"
  );

  console.log("Detected:", event);
}

main();