"use client"

import { ArrowLeft, ArrowRight, Play, CheckCircle, Star, BookOpen, Zap, Target, Clock, Award, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { LESSONS, LEVELS } from "@/content/lessons";
import { lessonState, nextLesson } from "@/lib/lessons";
import { loadProgress, type LearningProgress } from "@/lib/progress";
import LessonCard from "@/components/lessons/LessonCard";
import ProgressBar from "@/components/lessons/ProgressBar";

type GuideType = "Safety" | "Reference" | "Troubleshooting" | "Advanced";

interface Guide {
  id: number;
  title: string;
  description: string;
  type: GuideType;
  readTime: string;
  completed: boolean;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"lessons" | "guides">("lessons");
  const { user, loading: authLoading } = useRequireAuth();
  const [userProgress, setUserProgress] = useState<LearningProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setProgressLoading(true);
    loadProgress(user.uid)
      .then(setUserProgress)
      .catch((error) => console.error("Failed to load progress:", error))
      .finally(() => setProgressLoading(false));
  }, [user]);

  if (!authLoading && !user) {
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }
  if (authLoading || progressLoading) {
    return <div className="p-8 text-center">Loading your progress...</div>;
  }
  if (!userProgress) {
    return <div className="p-8 text-center text-red-500">Could not load user progress.</div>;
  }

  // Lessons come from src/content/lessons; their state from the user's progress
  const completedLessons = new Set(userProgress.completedLessons);
  const completedCount = LESSONS.filter(l => completedLessons.has(l.id)).length;
  const upNext = nextLesson(completedLessons);
  const completedGuides: number[] = userProgress.completedGuides;

  // Guides: all unlocked, completed if in completedGuides
  const allGuides: Guide[] = [
    {
      id: 1,
      title: "Circuit Safety Guide",
      description: "Essential safety practices when working with electronics",
      type: "Safety",
      readTime: "10 min",
      completed: false,
    },
    {
      id: 2,
      title: "Component Reference",
      description: "Complete guide to electronic components and their symbols",
      type: "Reference",
      readTime: "15 min",
      completed: false,
    },
    {
      id: 3,
      title: "Troubleshooting Circuits",
      description: "How to identify and fix common circuit problems",
      type: "Troubleshooting",
      readTime: "20 min",
      completed: false,
    },
    {
      id: 4,
      title: "Advanced Techniques",
      description: "Professional tips for complex circuit design",
      type: "Advanced",
      readTime: "25 min",
      completed: false,
    },
  ];
  const guides: Guide[] = allGuides.map((guide) => ({
    ...guide,
    completed: completedGuides.includes(guide.id),
  }));



  const getTypeColor = (type: GuideType): string => {
    switch (type) {
      case "Safety":
        return "bg-red-100 text-red-700"
      case "Reference":
        return "bg-blue-100 text-blue-700"
      case "Troubleshooting":
        return "bg-orange-100 text-orange-700"
      case "Advanced":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Handler to mark guide as completed
  const handleCompleteGuide = async (guideId: number) => {
    if (!user || !userProgress) return;
    if (userProgress.completedGuides.includes(guideId)) return; // Already completed
    const newCompleted = [...userProgress.completedGuides, guideId];
    const newXP = (userProgress.xp ?? 0) + 5;
    const newPoints = (userProgress.totalPoints ?? 0) + 5;
    await updateDoc(doc(firestore, "users", user.uid), {
      completedGuides: newCompleted,
      xp: newXP,
      totalPoints: newPoints,
    });
    setUserProgress((prev) => prev ? { ...prev, completedGuides: newCompleted, xp: newXP, totalPoints: newPoints } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to CirKit</span>
                </div>
              </Link>

              <div className="h-6 w-px bg-gray-300"></div>

              <h1 className="text-xl font-semibold text-gray-900">Learning Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/circuits">
                <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  My Circuits
                </button>
              </Link>
              <Link href="/simulation">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Go to Simulator</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Progress</h3>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {completedCount}/{LESSONS.length}
            </div>
            <ProgressBar value={completedCount} max={LESSONS.length} />
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userProgress.currentStreak} days</div>
            <p className="text-sm text-gray-500">Keep it up!</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Points</h3>
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userProgress.totalPoints}</div>
            <p className="text-sm text-gray-500">Earned from lessons</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Level</h3>
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Level {userProgress.level}</div>
            <p className="text-sm text-gray-500">50 pts to next level</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("lessons")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "lessons"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Lessons</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("guides")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "guides"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Guides</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "lessons" && (
              <div className="space-y-8">
                {/* Up next */}
                {upNext ? (
                  <Link
                    href={`/learn/${upNext.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-[#31393C] text-white p-5 hover:bg-[#31393C]/90 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-[#FDCA40] p-3 rounded-lg shrink-0">
                        <Play className="h-5 w-5 text-[#31393C]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white/70">{completedCount === 0 ? "Start here" : "Up next"} · Level {upNext.level}</p>
                        <h3 className="text-lg font-semibold truncate">{upNext.title}</h3>
                      </div>
                    </div>
                    <span className="flex items-center font-semibold text-[#FDCA40] shrink-0">
                      {completedCount === 0 ? "Start" : "Continue"}
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl bg-green-50 border border-green-200 p-5">
                    <Trophy className="h-8 w-8 text-green-600 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800">You&apos;ve completed every lesson!</h3>
                      <p className="text-sm text-green-700">More levels are on the way. Try building your own circuits in the simulator.</p>
                    </div>
                  </div>
                )}

                {LEVELS.map(level => {
                  const lessons = LESSONS.filter(l => l.level === level.level)
                  if (lessons.length === 0) return null
                  const done = lessons.filter(l => completedLessons.has(l.id)).length
                  return (
                    <section key={level.level}>
                      <div className="flex items-end justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Level {level.level}: {level.title}</h2>
                          <p className="text-sm text-gray-500">{level.description}</p>
                        </div>
                        <div className="w-32 shrink-0">
                          <p className="text-xs text-gray-500 text-right mb-1">{done}/{lessons.length} done</p>
                          <ProgressBar value={done} max={lessons.length} color="bg-green-500" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {lessons.map(lesson => (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            number={LESSONS.indexOf(lesson) + 1}
                            state={lessonState(lesson.id, completedLessons)}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            {activeTab === "guides" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Study Guides</h2>
                  <p className="text-sm text-gray-500">Reference materials and tutorials</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {guides.map((guide: Guide) => (
                    <div
                      key={guide.id}
                      className={`border rounded-lg p-6 transition-all ${
                        guide.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:shadow-md hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {guide.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(guide.type)}`}>
                          {guide.type}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{guide.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{guide.readTime}</span>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            guide.completed ? "bg-green-100 text-green-700" : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          disabled={guide.completed}
                          onClick={() => handleCompleteGuide(guide.id)}
                        >
                          {guide.completed ? "Review" : "Read Guide"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/simulation">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Practice Mode</h3>
                    <p className="text-sm text-gray-500">Build circuits freely</p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Daily Challenge</h3>
                  <p className="text-sm text-gray-500">Complete todays task</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Achievements</h3>
                  <p className="text-sm text-gray-500">View your progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
