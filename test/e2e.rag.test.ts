import Nodb from "../src/nodb";
import dotenv from "dotenv";
import path from "path";
import { projectPegasus, projectPhoenix } from "./seed";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb rag entities tests ", () => {
  const appName = "test-app";
  const envName = "test-env";

  const nodb = new Nodb({
    baseUrl: process.env.NODB_BASE_URL!,
  });
  const entityName = "test-entity";
  beforeAll(async () => {
    const result = await nodb.createApplication({
      appName,
      envName,
    });

    nodb.setToken(result.applicationTokens[0]!.key);

    await nodb.writeEntities({
      entityName,
      appName,
      envName,
      payload: [projectPhoenix, projectPegasus],
    });
  });

  afterAll(async () => {
    await nodb.deleteApplication({ appName });
  });

  test("should return some answer", async () => {
    const result = await nodb.inquire({
      appName,
      envName,
      inquiry: "Which projects do I have available?",
    });

    expect(Object.keys(result)).toEqual(["answer"]);
    expect(typeof result.answer).toBe("string");
  });
});
