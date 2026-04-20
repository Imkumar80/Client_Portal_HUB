import mongoose from "mongoose";
import {
  ProjectModel,
  ProjectFileModel,
  CommentModel,
  ActivityModel,
} from "./schema/projects";

// The API server will connect to MongoDB, but we'll export a connection helper if needed
export const connectDb = async (uri: string) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(uri, {
    tlsAllowInvalidCertificates: true,
  });
};

export { ProjectModel, ProjectFileModel, CommentModel, ActivityModel };
export * from "./schema/projects";
