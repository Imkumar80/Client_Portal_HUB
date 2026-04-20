import * as React from "react";
import { useGetDashboardStats, useGetRecentActivity, getGetDashboardStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CheckCircle2, Clock, Activity, FileText, MessageSquare, Plus, RefreshCw } from "lucide-react";
import { ACTIVITY_TYPE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  const { data: activity, isLoading: activityLoading } = useGetRecentActivity(
    { limit: 10 },
    {
      query: {
        queryKey: getGetRecentActivityQueryKey({ limit: 10 })
      }
    }
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your projects.</p>
      </div>

      {statsLoading || !stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-border/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-display font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stats.activeProjects}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stats.completedProjects}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stats.pendingProjects}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        <Card className="md:col-span-4 lg:col-span-2 shadow-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="font-display">Project Pipeline</CardTitle>
            <CardDescription>Current status breakdown across all active projects.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {statsLoading || !stats ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-2 flex-1" />
                    <Skeleton className="h-4 w-[30px]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(stats.byStatus)
                  .filter(([status]) => status !== 'cancelled' && status !== 'completed')
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                  const percentage = stats.activeProjects > 0 ? (count / stats.activeProjects) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5 text-sm">
                        <span className="font-medium">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                        <span className="text-muted-foreground">{count} projects</span>
                      </div>
                      <div className="h-2.5 w-full bg-secondary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(stats.byStatus).filter(s => s !== 'cancelled' && s !== 'completed').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active projects to display.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
            <CardDescription>Latest updates across your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading || !activity ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-[60px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length > 0 ? (
              <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-4 before:-translate-x-1/2 before:w-px before:bg-border">
                {activity.map((item, index) => {
                  const isLast = index === activity.length - 1;
                  
                  let icon;
                  let bgClass;
                  switch(item.type) {
                    case 'project_created':
                      icon = <Plus className="h-3.5 w-3.5 text-primary" />;
                      bgClass = "bg-primary/10 border-primary/20";
                      break;
                    case 'status_changed':
                      icon = <RefreshCw className="h-3.5 w-3.5 text-blue-600" />;
                      bgClass = "bg-blue-100 border-blue-200";
                      break;
                    case 'comment_added':
                      icon = <MessageSquare className="h-3.5 w-3.5 text-amber-600" />;
                      bgClass = "bg-amber-100 border-amber-200";
                      break;
                    case 'file_uploaded':
                      icon = <FileText className="h-3.5 w-3.5 text-emerald-600" />;
                      bgClass = "bg-emerald-100 border-emerald-200";
                      break;
                  }

                  return (
                    <div key={item.id} className="relative">
                      <div className={`absolute -left-[1.35rem] h-6 w-6 rounded-full border flex items-center justify-center bg-background z-10 ${bgClass}`}>
                        {icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">{ACTIVITY_TYPE_LABELS[item.type]}</span>
                          {" in "}
                          <Link href={`/projects/${item.projectId}`} className="font-medium text-primary hover:underline">
                            {item.projectTitle}
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}