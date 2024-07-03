import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb update entities/entity tests", () => {
  const app = process.env.NODB_APP!;
  const env = process.env.NODB_ENV!;

  const nodb = new Nodb({
    app,
    env,
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

    const projectPhoenixId = result[0]!;
    const projectPegasusId = result[1]!;

    // get what's in db so we could verify it
    const insertedProjectPhoenix = await nodb.getEntity({
      entityName,
      entityId: projectPhoenixId,
    });

    expect(insertedProjectPhoenix).toStrictEqual({
      ...projectPhoenix,
      id: projectPhoenixId,
      title: "Project Phoenix V2",
      __meta: {
        self: `/${app}/${env}/${entityName}/${projectPhoenixId}`,
      },
    });

    const insertedProjectPegasus = await nodb.getEntity({
      entityName,
      entityId: projectPegasusId,
    });

    expect(insertedProjectPegasus).toStrictEqual({
      ...projectPegasus,
      id: projectPegasusId,
      title: "Project Pegasus V2",
      __meta: {
        self: `/${app}/${env}/${entityName}/${projectPegasusId}`,
      },
    });
  });

  test("should update entity", async () => {
    const insertedProjectId = await nodb.updateEntity({
      entityName,
      payload: { title: "Project Titan V2", id: ids[2]! },
    });

    expect(insertedProjectId).toBe(ids[2]);
    const insertedProjectTitan = await nodb.getEntity({
      entityName,
      entityId: insertedProjectId,
    });

    expect(insertedProjectTitan).toStrictEqual({
      ...projectTitan,
      id: insertedProjectId,
      title: "Project Titan V2",
      __meta: {
        self: `/${app}/${env}/${entityName}/${insertedProjectId}`,
      },
    });
  });
});
