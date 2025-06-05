import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { MdOutlinePending } from "react-icons/md";
import { LuFileX } from "react-icons/lu";
import { GiFarmer } from "react-icons/gi";
import { BsFileEarmarkCheck, BsCalendarCheck } from "react-icons/bs";
import { FaSeedling } from "react-icons/fa";

Chart.register(...registerables);

const Dashboard = () => {
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  // Farm Training Dashboard Data
  const dashboardData = {
    totalFarmers: 150,
    pendingApplications: 35,
    approvedApplications: 95,
    rejectedApplications: 20,
    completedTrainings: 70,
    upcomingSessions: 5,
    trainingCategories: [
      "Organic Farming",
      "Livestock",
      "Agroforestry",
      "Irrigation",
    ],
  };

  const calculatePercentage = (value) =>
    dashboardData.totalFarmers > 0
      ? Math.round((value / dashboardData.totalFarmers) * 100)
      : 0;

  const approvedPercentage = calculatePercentage(
    dashboardData.approvedApplications
  );
  const pendingPercentage = calculatePercentage(
    dashboardData.pendingApplications
  );
  const rejectedPercentage = calculatePercentage(
    dashboardData.rejectedApplications
  );
  const completedPercentage = calculatePercentage(
    dashboardData.completedTrainings
  );

  const doughnutData = {
    labels: ["Approved", "Pending", "Rejected", "Completed"],
    datasets: [
      {
        data: [
          dashboardData.approvedApplications,
          dashboardData.pendingApplications,
          dashboardData.rejectedApplications,
          dashboardData.completedTrainings,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.2)",
          "rgba(234, 179, 8, 0.2)",
          "rgba(239, 68, 68, 0.2)",
          "rgba(59, 130, 246, 0.2)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Training Applications",
        data: [40, 65, 80, 78, 91, 95],
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10B981",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Completed Trainings",
        data: [10, 25, 40, 55, 60, 70],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3B82F6",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  useEffect(() => {
    return () => {
      if (lineChartRef.current) lineChartRef.current.destroy();
      if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="main-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Farmers */}
        <StatCard
          title="Registered Candidates"
          count={dashboardData.totalFarmers}
          icon={<GiFarmer className="h-6 w-6 text-indigo-600" />}
          bg="bg-indigo-100"
          textColor="text-indigo-600"
        />
        {/* Approved */}
        <StatCard
          title="Approved Applications"
          count={dashboardData.approvedApplications}
          percent={approvedPercentage}
          icon={<BsFileEarmarkCheck className="h-6 w-6 text-green-600" />}
          bg="bg-green-100"
          textColor="text-green-600"
        />
        {/* Pending */}
        <StatCard
          title="Pending Applications"
          count={dashboardData.pendingApplications}
          percent={pendingPercentage}
          icon={<MdOutlinePending className="h-6 w-6 text-yellow-600" />}
          bg="bg-yellow-100"
          textColor="text-yellow-600"
        />
        {/* Rejected */}
        <StatCard
          title="Rejected Applications"
          count={dashboardData.rejectedApplications}
          percent={rejectedPercentage}
          icon={<LuFileX className="h-6 w-6 text-red-600" />}
          bg="bg-red-100"
          textColor="text-red-600"
        />
        {/* Completed */}
        <StatCard
          title="Completed Trainings"
          count={dashboardData.completedTrainings}
          percent={completedPercentage}
          icon={<FaSeedling className="h-6 w-6 text-blue-600" />}
          bg="bg-blue-100"
          textColor="text-blue-600"
        />
        {/* Upcoming */}
        <StatCard
          title="Upcoming Sessions"
          count={dashboardData.upcomingSessions}
          icon={<BsCalendarCheck className="h-6 w-6 text-purple-600" />}
          bg="bg-purple-100"
          textColor="text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">
            Training Participation Trends
          </h2>
          <div className="h-[320px]">
            <Line
              data={lineData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">
            Application Status Distribution
          </h2>
          <div className="h-[300px]">
            <Doughnut
              data={doughnutData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, percent, icon, bg, textColor }) => (
  <div className="bg-white rounded-xl shadow p-6 border">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
    {percent !== undefined && (
      <p className={`mt-2 text-sm font-medium ${textColor}`}>
        {percent}% of total farmers
      </p>
    )}
  </div>
);

export default Dashboard;
