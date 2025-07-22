"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Video,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layouts/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface StatsPayload {
  totalStudents: number;
  activeClasses: number;
  completedSessions: number;
  upcomingSessions: number;
  teachingHours: number;
  averageRating: number;
  reviewCount: number;
  earnings: number;
}

interface EarningRecord {
  date: string; // ISO date
  amount: number;
}

interface SessionCard {
  _id: string;
  subject: { name: string; area: string };
  student: { name: string };
  status?: string;
  startTime?: string;
  date?: string;
  meetingLink?: string;
  reviewed?: boolean;
  isPastDue?: boolean;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [recent, setRecent] = useState<SessionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // 1) overall stats
      const stRes = await fetch("/api/teacher/stats");
      if (!stRes.ok) throw new Error("Stats fetch failed");
      setStats(await stRes.json());

      // 2) earnings
      const earnRes = await fetch("/api/earnings/teacher");
      if (!earnRes.ok) throw new Error("Earnings fetch failed");
      setEarnings(await earnRes.json());

      // 3) fetch all sessions, sort by date desc, take 3
      const sesRes = await fetch("/api/teacher/sessions");
      if (!sesRes.ok) throw new Error("Sessions fetch failed");
      const payload = await sesRes.json();
      const arr = Array.isArray(payload) ? payload : payload.sessions;
      const sorted = arr
        .slice()
        .sort((a, b) => {
          const da = new Date(a.startTime || a.date).getTime();
          const db = new Date(b.startTime || b.date).getTime();
          return db - da;
        })
        .slice(0, 3)
        .map((s: any) => ({
          _id: s._id ?? s.id,
          subject: s.subject ?? { name: "—", area: "—" },
          student:
            s.student && typeof s.student === "object" && "name" in s.student
              ? s.student
              : s.studentName
              ? { name: s.studentName }
              : { name: "—" },
          status: s.status,
          startTime: s.startTime,
          date: s.date,
          meetingLink: s.meetingLink,
          reviewed: s.reviewed,
          isPastDue: s.isPastDue,
        }));
      setRecent(sorted);

    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const formatDateTime = (dt?: string) => {
    if (!dt) return "";
    try {
      return new Date(dt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  };

  if (loading || !stats) return <LoadingSpinner />;

  // Overview chart
  const overviewLabels = [
    "Students",
    "Active Classes",
    "Completed",
    "Upcoming",
    "Hours",
    "Reviews",
    "Avg Rating",
  ];
  const overviewData = {
    labels: overviewLabels,
    datasets: [
      {
        label: "Overview",
        data: [
          stats.totalStudents,
          stats.activeClasses,
          stats.completedSessions,
          stats.upcomingSessions,
          stats.teachingHours,
          stats.reviewCount,
          stats.averageRating,
        ],
        backgroundColor: [
          "#2563eb",
          "#22c55e",
          "#a78bfa",
          "#f472b6",
          "#facc15",
          "#f87171",
          "#34d399",
        ],
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  // Monthly earnings chart
  const monthlyTotals: number[] = Array(12).fill(0);
  earnings.forEach((e) => {
    const m = new Date(e.date).getMonth();
    monthlyTotals[m] += e.amount;
  });
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const earningsData = {
    labels: monthLabels,
    datasets: [
      {
        label: "₦ Earned",
        data: monthlyTotals,
        backgroundColor: "#f59e0b",
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <PageHeader>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Your teaching overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Students */}
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-6 w-6 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        {/* Avg Rating */}
        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Active Classes */}
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-6 w-6 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Active Classes</p>
              <p className="text-2xl font-bold">{stats.activeClasses}</p>
            </div>
          </CardContent>
        </Card>
        {/* Completed */}
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-6 w-6 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completedSessions}</p>
            </div>
          </CardContent>
        </Card>
        {/* Earnings */}
        <Card>
          <CardContent className="flex items-center p-6">
            <CreditCard className="h-6 w-6 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Earnings</p>
              <p className="text-2xl font-bold">
                ₦{stats.earnings.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Chart */}
      <Card className="mt-6 p-4">
        <h2 className="mb-2 font-semibold">Overview</h2>
        <div className="h-72">
          <Bar
            data={overviewData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </Card>

      {/* Monthly Earnings Chart */}
      <Card className="mt-6 p-4">
        <h2 className="mb-2 font-semibold">Monthly Earnings</h2>
        <div className="h-72">
          <Bar
            data={earningsData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </Card>

      {/* Recent Sessions */}
      {recent.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">
          No recent sessions to show.
        </p>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Sessions</h3>
            <Link href="/dashboard/teacher/sessions">
              <Button variant="outline" size="sm">
                Show More
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((s) => (
              <Card key={s._id}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{s.subject.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.subject.area}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Student: {s.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(s.startTime || s.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        s.status === "completed"
                          ? "text-green-600"
                          : s.status === "scheduled" || s.status === "upcoming"
                          ? "text-blue-600"
                          : "text-muted-foreground"
                      }
                    >
                      {s.status
                        ? s.status.charAt(0).toUpperCase() + s.status.slice(1)
                        : ""}
                    </span>
                    {s.reviewed && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Reviewed
                      </span>
                    )}
                    {s.isPastDue && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        Past Due
                      </span>
                    )}
                  </div>

                  {s.meetingLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={s.isPastDue || s.status !== "scheduled"}
                      onClick={() =>
                        !s.isPastDue &&
                        s.status === "scheduled" &&
                        window.open(s.meetingLink, "_blank")
                      }
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {s.isPastDue || s.status !== "scheduled"
                        ? "Session Ended"
                        : "Join Meeting"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageHeader>
  );
}
