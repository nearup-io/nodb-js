import Nodb from "../src/nodb";
import { Project, projectPegasus, projectPhoenix, projectTitan } from "./seed";

describe("Write entities test", () => {
  const nodb = new Nodb({
    app: process.env.NODB_APP!,
    env: process.env.NODB_ENV!,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
  });

  test("should create entities", async () => {
    const result = await nodb.writeEntities({
      entityName,
      payload: [projectPhoenix, projectPegasus],
    });

    expect(result.length).toBe(2);
    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("string");
  });

  test("should create entity", async () => {
    const result = await nodb.writeEntity({
      entityName,
      payload: projectTitan,
    });

    expect(typeof result).toBe("string");
  });
});
