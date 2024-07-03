import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb update entities/entity tests", () => {
  const nodb = new Nodb({
    app: process.env.NODB_APP!,
    env: process.env.NODB_ENV!,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";
  let ids: string[] = [];

  beforeAll(async () => {
    ids = await nodb.writeEntities({
      entityName,
      payload: [projectPhoenix, projectPegasus],
    });
    const lastId = await nodb.writeEntity({
      entityName,
      payload: projectTitan,
    });
    ids.push(lastId);
  });

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
  });

  test("should update entities", async () => {
    const result = await nodb.updateEntities({
      entityName,
      payload: [
        { title: "Project Phoenix V2", id: ids[0]! },
        { title: "Project Pegasus V2", id: ids[1]! },
      ],
    });

    expect(result.length).toBe(2);
    expect(result[0]).toBe(ids[0]);
    expect(result[1]).toBe(ids[1]);
  });

  test("should update entity", async () => {
    const result = await nodb.updateEntity({
      entityName,
      payload: { title: "Project Titan V2", id: ids[2]! },
    });

    expect(result).toBe(ids[2]);
  });
});
