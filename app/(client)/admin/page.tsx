import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { Users, MapPin, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  // Placeholder stats (in production, fetch from DB)
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Total Trips",
      value: "5,678",
      change: "+23%",
      icon: MapPin,
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Active Users",
      value: "342",
      change: "+8%",
      icon: TrendingUp,
      color: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "This Month",
      value: "456",
      change: "+15%",
      icon: Calendar,
      color: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session.user.name || "Admin"}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{stat.title}</CardTitle>
                      <CardDescription className="text-green-600 font-semibold mt-1">
                        {stat.change}
                      </CardDescription>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className={`${stat.textColor} h-6 w-6`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
              <CardDescription>Latest trips created by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">Hunza Valley Adventure</p>
                      <p className="text-sm text-gray-600">By User {i + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">7 days</p>
                      <p className="text-sm text-gray-600">₨50,000</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "New Users", value: 45 },
                  { label: "New Trips", value: 123 },
                  { label: "Emails Sent", value: 1024 },
                  { label: "Support Tickets", value: 8 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-indigo-600">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management + Trip Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle>Top Users</CardTitle>
              <CardDescription>Users with most trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">User Name {i + 1}</p>
                        <p className="text-xs text-gray-600">{i + 3} trips</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "View All Users", color: "bg-blue" },
                  { label: "View All Trips", color: "bg-purple" },
                  { label: "View Analytics", color: "bg-green" },
                  { label: "Send Announcement", color: "bg-orange" },
                  { label: "System Settings", color: "bg-red" },
                  { label: "Export Reports", color: "bg-indigo" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`${action.color}-100 hover:${action.color}-200 transition-colors text-${action.color}-700 font-medium py-2 px-3 rounded-lg text-sm`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
