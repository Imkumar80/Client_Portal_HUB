import * as React from "react";
import { useParams } from "wouter";
import { 
  useGetProject, 
  getGetProjectQueryKey,
  useUpdateProject,
  useDeleteProject,
  useUploadFile,
  useAddComment,
  getListProjectsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetRecentActivityQueryKey,
  ProjectStatus,
  ProjectPriority
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  User, 
  Clock, 
  CreditCard,
  FileText,
  Upload,
  MessageSquare,
  MoreVertical,
  Trash2,
  File,
  Send,
  Loader2
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PROJECT_TYPE_LABELS, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";

export default function ProjectDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const { data: project, isLoading } = useGetProject(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProjectQueryKey(id)
    }
  });

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addComment = useAddComment();
  const uploadFile = useUploadFile(); // Mock implementation since we don't have a real file picker

  if (isLoading || !project) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateProject.mutate(
      { id, data: { status: newStatus as ProjectStatus } },
      {
        onSuccess: () => {
          toast({ title: "Status updated" });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        }
      }
    );
  };

  const handlePriorityChange = (newPriority: string) => {
    updateProject.mutate(
      { id, data: { priority: newPriority as ProjectPriority } },
      {
        onSuccess: () => {
          toast({ title: "Priority updated" });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteProject.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Project deleted" });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          setLocation("/projects");
        }
      }
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment.mutate(
      { 
        id, 
        data: { 
          author: "Studio Agency", 
          authorRole: "designer", 
          content: commentText 
        } 
      },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to post comment" });
        }
      }
    );
  };

  const handleSimulateFileUpload = () => {
    uploadFile.mutate(
      {
        id,
        data: {
          fileName: `reference-asset-${Math.floor(Math.random() * 1000)}.pdf`,
          fileType: "application/pdf",
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          url: "https://example.com/mock-file.pdf"
        }
      },
      {
        onSuccess: () => {
          toast({ title: "File uploaded" });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        }
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 shrink-0 rounded-full">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-foreground line-clamp-1">{project.title}</h1>
              <StatusBadge status={project.status} className="text-sm px-2.5 py-0.5" />
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span>{PROJECT_TYPE_LABELS[project.projectType]}</span>
              <span>&bull;</span>
              <span>Added {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg">Project Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {project.description.split('\n').map((para, i) => (
                  <p key={i} className="leading-relaxed">{para}</p>
                ))}
              </div>
              
              {project.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Internal Notes</h4>
                    <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground italic border border-border/50">
                      {project.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.comments && project.comments.length > 0 ? (
                <div className="space-y-6">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10 border border-border shadow-sm">
                        <AvatarFallback className={comment.authorRole === 'designer' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700'}>
                          {comment.author.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-sm text-foreground">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No comments yet. Start the conversation!
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t bg-muted/10">
              <div className="relative">
                <Textarea 
                  placeholder="Reply to client..." 
                  className="min-h-[80px] resize-none pr-12 pb-10"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addComment.isPending}
                >
                  {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Meta */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="font-display text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Client</div>
                  <div className="font-medium">{project.clientName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {project.clientEmail}</div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Status</div>
                    <Select value={project.status} onValueChange={handleStatusChange} disabled={updateProject.isPending}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Priority</div>
                    <Select value={project.priority} onValueChange={handlePriorityChange} disabled={updateProject.isPending}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Deadline</div>
                    <div className="text-sm font-medium">
                      {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Budget</div>
                    <div className="text-sm font-medium">{project.budget || 'Not set'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Files
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleSimulateFileUpload} disabled={uploadFile.isPending}>
                {uploadFile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {project.files && project.files.length > 0 ? (
                <div className="space-y-3">
                  {project.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-card hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                        <File className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.fileName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {format(new Date(file.uploadedAt), 'MMM d')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.title}" and all associated files and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}