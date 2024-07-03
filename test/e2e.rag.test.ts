import Nodb from "../src/nodb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb rag entities tests ", () => {
  const app = process.env.NODB_APP!;
  const env = process.env.NODB_ENV!;

  const nodb = new Nodb({
    app,
    env,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
  });

  test("should return some answer", async () => {
    const result = await nodb.getInquiry({
      inquiry: "Which projects do I have available?",
    });

    expect(Object.keys(result)).toEqual(["answer"]);
    expect(typeof result.answer).toBe("string");
  });
});
