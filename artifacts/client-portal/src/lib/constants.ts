import { ActivityItemType, ProjectPriority, ProjectStatus, ProjectProjectType } from "@workspace/api-client-react";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent"
};

export const PROJECT_TYPE_LABELS: Record<ProjectProjectType, string> = {
  logo: "Logo Design",
  branding: "Branding",
  web_design: "Web Design",
  print: "Print",
  social_media: "Social Media",
  illustration: "Illustration",
  other: "Other"
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityItemType, string> = {
  project_created: "Project created",
  status_changed: "Status updated",
  comment_added: "Comment added",
  file_uploaded: "File uploaded"
};
