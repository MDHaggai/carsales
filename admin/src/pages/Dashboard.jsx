import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Pie } from 'react-chartjs-2';
import { 
  FaCar, 
  FaTags, 
  FaShoppingCart, 
  FaUsers, 
  FaMoneyBillWave, 
  FaArrowUp
} from 'react-icons/fa';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalBrands: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    bestsellers: 0,
    recentOrders: [],
    brandDistribution: {},
    monthlyRevenue: [],
    popularVehicles: []
  });

  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      const [products, brands, orders] = await Promise.all([
        axios.get(`${backendUrl}/api/product/list`),
        axios.get(`${backendUrl}/api/brand/list`),
        axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } })
      ]);

      // Fixed revenue calculation
      const totalRevenue = orders.data.orders.reduce((sum, order) => {
        // Calculate total amount for each order's items
        const orderTotal = order.items.reduce((itemSum, item) => {
          return itemSum + (item.price * item.quantity);
        }, 0);
        return sum + orderTotal;
      }, 0);

      // Rest of your existing code...
      setStats({
        totalVehicles: products.data.products.length,
        totalBrands: brands.data.brands.length,
        totalOrders: orders.data.orders.length,
        totalRevenue,
        activeUsers: Math.floor(Math.random() * 100) + 50, // Simulate active users
        bestsellers: products.data.products.filter(p => p.bestseller).length,
        recentOrders: orders.data.orders.slice(0, 5),
        brandDistribution: products.data.products.reduce((acc, product) => {
          acc[product.brand] = (acc[product.brand] || 0) + 1;
          return acc;
        }, {}),
        monthlyRevenue: processMonthlyRevenue(orders.data.orders),
        popularVehicles: products.data.products
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (orders) => {
    const monthlyData = Array(12).fill(0);

    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth(); // Changed from order.date to order.createdAt
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      monthlyData[month] += orderTotal;
    });

    return monthlyData;
  };

  // Chart Configurations
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Revenue',
      data: stats.monthlyRevenue,
      fill: true,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const brandChartData = {
    labels: Object.keys(stats.brandDistribution),
    datasets: [{
      data: Object.values(stats.brandDistribution),
      backgroundColor: [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
        '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4'
      ]
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: 'Total Vehicles',
                value: stats.totalVehicles,
                icon: FaCar,
                color: 'blue'
              },
              {
                title: 'Total Orders',
                value: stats.totalOrders,
                icon: FaShoppingCart,
                color: 'green'
              },
              {
                title: 'Revenue',
                value: `${currency}${stats.totalRevenue.toLocaleString()}`,
                icon: FaMoneyBillWave,
                color: 'yellow'
              },
              {
                title: 'Active Users',
                value: stats.activeUsers,
                icon: FaUsers,
                color: 'purple'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className={`flex items-center justify-between mb-4`}>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="text-sm font-medium text-green-500 flex items-center"
                  >
                    +12.5%
                    <FaArrowUp className="ml-1" />
                  </motion.div>
                </div>
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
              <Line data={revenueChartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }} />
            </motion.div>

            {/* Brand Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Brand Distribution</h3>
              <Pie data={brandChartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} />
            </motion.div>
          </div>

          {/* Recent Orders & Popular Vehicles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.items[0].name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {currency}{order.amount}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Popular Vehicles */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Popular Vehicles</h3>
              <div className="space-y-4">
                {stats.popularVehicles.map((vehicle, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={vehicle.images[0]} 
                      alt={vehicle.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">{vehicle.brand}</p>
                    </div>
                    {vehicle.bestseller && (
                      <FaStar className="text-yellow-400 w-5 h-5" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;