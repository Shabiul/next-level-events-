import { entityExtractorService } from "../ai/services/entity-extractor.service";

const query =
  "Show me premium birthday decorations under 5000 with blue theme";

console.log(entityExtractorService.extract(query));