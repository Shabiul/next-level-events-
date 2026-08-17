import { intentDetectorService } from "../ai/services/intent-detector.service";

const tests = [
  "Hi",
  "Show me birthday decorations",
  "Recommend premium anniversary decoration",
  "Book my decoration",
  "What are your working hours?",
  "I need help with my booking",
  "Call me",
  "Thank you",
  "Bye",
  "random text",
];

for (const query of tests) {
  console.log(query);
  console.log(intentDetectorService.detect(query));
  console.log("------------------------");
}