import mongoose, { Schema, Document } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import { z } from "zod";

const AutoIncrement = AutoIncrementFactory(mongoose);

// Project
export interface Project extends Document {
  id: number;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  projectType: string;
  status: string;
  priority: string;
  budget?: string | null;
  deadline?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<Project>(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    projectType: { type: String, required: true },
    status: { type: String, required: true, default: "pending" },
    priority: { type: String, required: true, default: "normal" },
    budget: { type: String, default: null },
    deadline: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

ProjectSchema.plugin(AutoIncrement, { inc_field: "id", id: "project_id" });

export const ProjectModel =
  mongoose.models.Project || mongoose.model<Project>("Project", ProjectSchema);

// Project File
export interface ProjectFile extends Document {
  id: number;
  projectId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

const ProjectFileSchema = new Schema<ProjectFile>(
  {
    projectId: { type: Number, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { timestamps: { createdAt: "uploadedAt", updatedAt: false } }
);

ProjectFileSchema.plugin(AutoIncrement, { inc_field: "id", id: "project_file_id" });

export const ProjectFileModel =
  mongoose.models.ProjectFile ||
  mongoose.model<ProjectFile>("ProjectFile", ProjectFileSchema);

// Comment
export interface Comment extends Document {
  id: number;
  projectId: number;
  author: string;
  authorRole: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<Comment>(
  {
    projectId: { type: Number, required: true },
    author: { type: String, required: true },
    authorRole: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommentSchema.plugin(AutoIncrement, { inc_field: "id", id: "comment_id" });

export const CommentModel =
  mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);

// Activity
export interface Activity extends Document {
  id: number;
  type: string;
  projectId: number;
  projectTitle: string;
  description: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<Activity>(
  {
    type: { type: String, required: true },
    projectId: { type: Number, required: true },
    projectTitle: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.plugin(AutoIncrement, { inc_field: "id", id: "activity_id" });

export const ActivityModel =
  mongoose.models.Activity || mongoose.model<Activity>("Activity", ActivitySchema);
