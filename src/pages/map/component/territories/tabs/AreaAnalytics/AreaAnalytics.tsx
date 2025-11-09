"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Text } from "recharts";

export default function AreaAnalytics({ projects = [] }: any){
  const [selectedArea, setSelectedArea] = useState("West Zone");
  if (!projects.length) {
    console.log(projects!.length);
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md text-center text-gray-500">
        No project data available.
      </div>
    );
  }


  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  const projectStatusMap: Record<string, { count: number; totalUnits: number }> = {};
    for (const p of projects) {
        const status = p.status || "Unknown";
        const units = Number(p.totalUnits) || 0;
        if (!projectStatusMap[status]) projectStatusMap[status] = { count: 0, totalUnits: 0 };
        projectStatusMap[status].count += 1;
        projectStatusMap[status].totalUnits += units;
    }

  const projectStatus = Object.entries(projectStatusMap).map(([status, data]) => ({
    _id: status,
    count: data.count,
    totalUnits: data.totalUnits,
  }));


  const projectTypeMap: Record<string, number> = {};
  for (const p of projects) {
    const type = p.type || "Unknown";
    projectTypeMap[type] = (projectTypeMap[type] || 0) + 1;
  }
  const projectType = Object.entries(projectTypeMap).map(([type, count]) => ({ type, count }));




  return (
    <div className="p-2 bg-white rounded-2xl shadow-md space-y-6  mx-auto">
      
      {/* Project Status Bar Chart */}
      <div>
        {/* <h3 className="text-lg font-medium text-gray-700 mb-2">Project Status Distribution</h3> */}
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={projectStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" interval={0} angle={1} textAnchor="end" height={20} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => `${value}`} />
            <Legend  />
            <Bar dataKey="count" fill="#8884d8" name="Projects" />
            {/* <Bar dataKey="totalUnits" fill="#82ca9d" name="Units" /> */}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Project Type Pie Chart */}
      {/* <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Project Type Composition</h3>
        <PieChart width={400} height={250}>
          <Pie
            data={mockAnalytics.projectType}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {mockAnalytics.projectType.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div> */}

      {/* Top Builders */}
      {/* <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Top Builders in {mockAnalytics.area}</h3>
        <ul className="divide-y divide-gray-200">
          {mockAnalytics.topBuilders.map((b, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>{b.name}</span>
              <span className="font-semibold">{b.projects} projects</span>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
