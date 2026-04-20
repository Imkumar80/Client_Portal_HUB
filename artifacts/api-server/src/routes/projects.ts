import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";

function serializeDates<T>(record: T): T {
  if (record === null || record === undefined) return record;
  if (Array.isArray(record)) return record.map(serializeDates) as unknown as T;
  if (record instanceof Date) return record.toISOString() as unknown as T;
  if (typeof record === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record as Record<string, unknown>)) {
      result[key] = value instanceof Date ? value.toISOString() : value;
    }
    return result as T;
  }
  return record;
}
import {
  db,
  projectsTable,
  projectFilesTable,
  commentsTable,
  activityTable,
} from "@workspace/db";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
  UploadFileParams,
  UploadFileBody,
  ListCommentsParams,
  AddCommentParams,
  AddCommentBody,
  ListProjectsResponse,
  ListProjectsResponseItem,
  GetProjectResponse,
  UpdateProjectResponse,
  GetDashboardStatsResponse,
  GetRecentActivityResponse,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const query = ListProjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.status) {
    conditions.push(eq(projectsTable.status, query.data.status));
  }
  if (query.data.clientName) {
    conditions.push(
      sql`lower(${projectsTable.clientName}) like lower(${"%" + query.data.clientName + "%"})`,
    );
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(projectsTable.createdAt));

  res.json(ListProjectsResponse.parse(serializeDates(projects)));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      title: parsed.data.title,
      description: parsed.data.description,
      projectType: parsed.data.projectType,
      priority: parsed.data.priority,
      budget: parsed.data.budget ?? null,
      deadline: parsed.data.deadline ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  await db.insert(activityTable).values({
    type: "project_created",
    projectId: project.id,
    projectTitle: project.title,
    description: `New project request submitted by ${project.clientName}`,
  });

  res.status(201).json(ListProjectsResponseItem.parse(serializeDates(project)));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const files = await db
    .select()
    .from(projectFilesTable)
    .where(eq(projectFilesTable.projectId, params.data.id));

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.projectId, params.data.id))
    .orderBy(desc(commentsTable.createdAt));

  res.json(GetProjectResponse.parse(serializeDates({ ...project, files, comments })));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const updateData: Partial<typeof projectsTable.$inferInsert> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.priority !== undefined)
    updateData.priority = parsed.data.priority;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.deadline !== undefined)
    updateData.deadline = parsed.data.deadline;

  const [project] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await db.insert(activityTable).values({
      type: "status_changed",
      projectId: project.id,
      projectTitle: project.title,
      description: `Status changed from ${existing.status} to ${parsed.data.status}`,
    });
  }

  res.json(UpdateProjectResponse.parse(serializeDates(project)));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/projects/:id/files", async (req, res): Promise<void> => {
  const params = UploadFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UploadFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [file] = await db
    .insert(projectFilesTable)
    .values({
      projectId: params.data.id,
      fileName: parsed.data.fileName,
      fileType: parsed.data.fileType,
      fileSize: parsed.data.fileSize,
      url: parsed.data.url,
    })
    .returning();

  await db.insert(activityTable).values({
    type: "file_uploaded",
    projectId: params.data.id,
    projectTitle: project.title,
    description: `File "${parsed.data.fileName}" uploaded`,
  });

  res.status(201).json(serializeDates(file));
});

router.get("/projects/:id/comments", async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.projectId, params.data.id))
    .orderBy(desc(commentsTable.createdAt));

  res.json(serializeDates(comments));
});

router.post("/projects/:id/comments", async (req, res): Promise<void> => {
  const params = AddCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({
      projectId: params.data.id,
      author: parsed.data.author,
      authorRole: parsed.data.authorRole,
      content: parsed.data.content,
    })
    .returning();

  await db.insert(activityTable).values({
    type: "comment_added",
    projectId: params.data.id,
    projectTitle: project.title,
    description: `${parsed.data.author} added a comment`,
  });

  res.status(201).json(serializeDates(comment));
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) =>
    ["in_review", "in_progress", "revision"].includes(p.status),
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed",
  ).length;
  const pendingProjects = projects.filter(
    (p) => p.status === "pending",
  ).length;

  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    byType[p.projectType] = (byType[p.projectType] ?? 0) + 1;
  }

  res.json(
    GetDashboardStatsResponse.parse({
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      byStatus,
      byType,
    }),
  );
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 10) : 10;

  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(limit);

  res.json(GetRecentActivityResponse.parse(serializeDates(activities)));
});

export default router;
