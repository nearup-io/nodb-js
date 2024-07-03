import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";
import { NodbError } from "../src/errors";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb delete entities/entity tests", () => {
  const app = process.env.NODB_APP!;
  const env = process.env.NODB_ENV!;

  const nodb = new Nodb({
    app,
    env,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";
  const entityName2 = "testProject2";
  let ids: string[] = [];

  beforeAll(async () => {
    ids = await nodb.writeEntities({
      entityName,
      payload: [projectPhoenix, projectPegasus],
    });
    const lastId = await nodb.writeEntity({
      entityName: entityName2,
      payload: projectTitan,
    });
    ids.push(lastId);
  });

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
    await nodb.deleteEntities({ entityName: entityName2 });
  });

  test("should delete entities", async () => {
    const result = await nodb.deleteEntities({ entityName });

    expect(result).toBe(2);

    const projectPhoenixId = ids[0]!;
    const projectPegasusId = ids[1]!;

    await expect(
      nodb.getEntity({
        entityName,
        entityId: projectPhoenixId,
      }),
    ).rejects.toThrow(NodbError);

    await expect(
      nodb.getEntity({
        entityName,
        entityId: projectPegasusId,
      }),
    ).rejects.toThrow(NodbError);
  });

  test("should delete entity", async () => {
    const deleted = await nodb.deleteEntity({
      entityName: entityName2,
      entityId: ids[2]!,
    });

    expect(deleted).toBe(true);
    await expect(
      nodb.getEntity({
        entityName,
        entityId: ids[2]!,
      }),
    ).rejects.toThrow(NodbError);
  });
});
