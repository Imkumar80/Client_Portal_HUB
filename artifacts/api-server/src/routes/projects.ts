import { Router, type IRouter } from "express";

function serializeDates<T>(record: T): T {
  if (record === null || record === undefined) return record;
  if (Array.isArray(record)) return record.map(serializeDates) as unknown as T;
  if (record instanceof Date) return record.toISOString() as unknown as T;
  if (typeof record === "object" && record !== null) {
    if (typeof (record as any).toJSON === "function") {
      record = (record as any).toJSON();
    }
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record as Record<string, unknown>)) {
      if (key === "_id" || key === "__v") continue; // Skip mongoose specific fields
      result[key] = value instanceof Date ? value.toISOString() : value;
    }
    return result as T;
  }
  return record;
}

import {
  ProjectModel,
  ProjectFileModel,
  CommentModel,
  ActivityModel,
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

  const conditions: any = {};
  if (query.data.status) {
    conditions.status = query.data.status;
  }
  if (query.data.clientName) {
    conditions.clientName = { $regex: query.data.clientName, $options: "i" };
  }

  const projects = await ProjectModel.find(conditions).sort({ createdAt: -1 });

  res.json(ListProjectsResponse.parse(serializeDates(projects)));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const project = await ProjectModel.create({
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail,
    title: parsed.data.title,
    description: parsed.data.description,
    projectType: parsed.data.projectType,
    priority: parsed.data.priority,
    budget: parsed.data.budget ?? null,
    deadline: parsed.data.deadline ?? null,
    notes: parsed.data.notes ?? null,
  });

  await ActivityModel.create({
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

  const project = await ProjectModel.findOne({ id: params.data.id });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const files = await ProjectFileModel.find({ projectId: params.data.id });
  const comments = await CommentModel.find({ projectId: params.data.id }).sort({ createdAt: -1 });

  const responseData = serializeDates({ ...project.toJSON(), files, comments });
  res.json(GetProjectResponse.parse(responseData));
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

  const existing = await ProjectModel.findOne({ id: params.data.id });

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const updateData: any = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.deadline !== undefined) updateData.deadline = parsed.data.deadline;

  const project = await ProjectModel.findOneAndUpdate(
    { id: params.data.id },
    { $set: updateData },
    { new: true }
  );

  if (project && parsed.data.status && parsed.data.status !== existing.status) {
    await ActivityModel.create({
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

  const project = await ProjectModel.findOneAndDelete({ id: params.data.id });

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

  const project = await ProjectModel.findOne({ id: params.data.id });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const file = await ProjectFileModel.create({
    projectId: params.data.id,
    fileName: parsed.data.fileName,
    fileType: parsed.data.fileType,
    fileSize: parsed.data.fileSize,
    url: parsed.data.url,
  });

  await ActivityModel.create({
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

  const comments = await CommentModel.find({ projectId: params.data.id }).sort({ createdAt: -1 });

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

  const project = await ProjectModel.findOne({ id: params.data.id });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const comment = await CommentModel.create({
    projectId: params.data.id,
    author: parsed.data.author,
    authorRole: parsed.data.authorRole,
    content: parsed.data.content,
  });

  await ActivityModel.create({
    type: "comment_added",
    projectId: params.data.id,
    projectTitle: project.title,
    description: `${parsed.data.author} added a comment`,
  });

  res.status(201).json(serializeDates(comment));
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const projects = await ProjectModel.find();

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

  const activities = await ActivityModel.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(GetRecentActivityResponse.parse(serializeDates(activities)));
});

export default router;
