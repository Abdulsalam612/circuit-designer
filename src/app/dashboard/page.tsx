"use client"

import { ArrowLeft, Play, CheckCircle, Lock, Star, BookOpen, Zap, Target, Clock, Award } from "lucide-react"
import Link from "next/link"

// Add type definitions after the imports
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type GuideType = "Safety" | "Reference" | "Troubleshooting" | "Advanced";

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  completed: boolean;
  locked: boolean;
  points: number;
}

interface Guide {
  id: number;
  title: string;
  description: string;
  type: GuideType;
  readTime: string;
  completed: boolean;
}

interface UserProgress {
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalPoints: number;
  level: number;
}

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"lessons" | "guides">("lessons");
  const { user, loading: authLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      setProgressLoading(true);
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProgress({
          completedLessons: data.completedLessons ?? 0,
          totalLessons: data.totalLessons ?? 0,
          currentStreak: data.currentStreak ?? 0,
          totalPoints: data.totalPoints ?? 0,
          level: data.level ?? 1,
        });
      }
      setProgressLoading(false);
    };
    if (user) fetchProgress();
  }, [user]);

  if (authLoading || progressLoading) {
    return <div className="p-8 text-center">Loading your progress...</div>;
  }
  if (!userProgress) {
    return <div className="p-8 text-center text-red-500">Could not load user progress.</div>;
  }

  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Introduction to Electricity",
      description: "Learn the basics of electrical current, voltage, and resistance",
      duration: "15 min",
      difficulty: "Beginner",
      completed: true,
      locked: false,
      points: 50,
    },
    {
      id: 2,
      title: "Understanding Components",
      description: "Explore LEDs, resistors, batteries, and switches",
      duration: "20 min",
      difficulty: "Beginner",
      completed: true,
      locked: false,
      points: 75,
    },
    {
      id: 3,
      title: "Your First Circuit",
      description: "Build a simple LED circuit with a battery and resistor",
      duration: "25 min",
      difficulty: "Beginner",
      completed: true,
      locked: false,
      points: 100,
    },
    {
      id: 4,
      title: "Series Circuits",
      description: "Connect components in series and understand current flow",
      duration: "30 min",
      difficulty: "Intermediate",
      completed: false,
      locked: false,
      points: 125,
    },
    {
      id: 5,
      title: "Parallel Circuits",
      description: "Learn how parallel connections affect voltage and current",
      duration: "30 min",
      difficulty: "Intermediate",
      completed: false,
      locked: false,
      points: 125,
    },
    {
      id: 6,
      title: "Ohm's Law",
      description: "Master the fundamental relationship between V, I, and R",
      duration: "35 min",
      difficulty: "Intermediate",
      completed: false,
      locked: true,
      points: 150,
    },
    {
      id: 7,
      title: "Switches and Control",
      description: "Add interactive control to your circuits",
      duration: "25 min",
      difficulty: "Intermediate",
      completed: false,
      locked: true,
      points: 100,
    },
    {
      id: 8,
      title: "Complex Circuits",
      description: "Combine series and parallel elements",
      duration: "40 min",
      difficulty: "Advanced",
      completed: false,
      locked: true,
      points: 200,
    },
  ]

  const guides: Guide[] = [
    {
      id: 1,
      title: "Circuit Safety Guide",
      description: "Essential safety practices when working with electronics",
      type: "Safety",
      readTime: "10 min",
      completed: true,
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
  ]

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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

            <Link href="/simulation">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Go to Simulator</span>
              </button>
            </Link>
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
              {userProgress.completedLessons}/{userProgress.totalLessons}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(userProgress.completedLessons / userProgress.totalLessons) * 100}%` }}
              ></div>
            </div>
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
            <p className="text-sm text-gray-500">+50 today</p>
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
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Interactive Lessons</h2>
                  <p className="text-sm text-gray-500">Complete lessons to unlock new content</p>
                </div>

                <div className="grid gap-4">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`border rounded-lg p-6 transition-all ${
                        lesson.locked
                          ? "bg-gray-50 border-gray-200"
                          : lesson.completed
                            ? "bg-green-50 border-green-200 hover:shadow-md"
                            : "bg-white border-gray-200 hover:shadow-md hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : lesson.locked ? (
                                <Lock className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Play className="h-5 w-5 text-blue-500" />
                              )}
                              <h3 className={`font-semibold ${lesson.locked ? "text-gray-400" : "text-gray-900"}`}>
                                Lesson {lesson.id}: {lesson.title}
                              </h3>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}
                            >
                              {lesson.difficulty}
                            </span>
                          </div>

                          <p className={`mb-3 ${lesson.locked ? "text-gray-400" : "text-gray-600"}`}>
                            {lesson.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{lesson.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>{lesson.points} points</span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6">
                          {lesson.completed ? (
                            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                              Review
                            </button>
                          ) : lesson.locked ? (
                            <button className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                              Locked
                            </button>
                          ) : (
                            <Link href="/simulation">
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Start Lesson
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "guides" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Study Guides</h2>
                  <p className="text-sm text-gray-500">Reference materials and tutorials</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {guides.map((guide) => (
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
