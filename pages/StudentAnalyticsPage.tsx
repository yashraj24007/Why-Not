import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Briefcase, Download } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

interface DepartmentStats {
  department: string;
  total: number;
  placed: number;
  percentage: number;
}

interface StatusStats {
  status: string;
  count: number;
  percentage: number;
}

const StudentAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [placedStudents, setPlacedStudents] = useState(0);
  const [avgCGPA, setAvgCGPA] = useState(0);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats[]>([]);
  const [unplacedStudents, setUnplacedStudents] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          *,
          student_profile:student_profiles(*)
        `)
        .eq('role', 'STUDENT');

      if (studentsError) throw studentsError;

      // Fetch all applications with offers/accepted status
      const { data: placedApps, error: placedError } = await supabase
        .from('applications')
        .select('student_id, status')
        .in('status', ['OFFERED', 'ACCEPTED']);

      if (placedError) throw placedError;

      const placedStudentIds = new Set(placedApps?.map(app => app.student_id) || []);
      const placed = placedStudentIds.size;
      const total = students?.length || 0;

      setTotalStudents(total);
      setPlacedStudents(placed);

      // Calculate average CGPA
      const cgpaSum = students?.reduce((sum, s) => {
        const cgpa = s.student_profile?.cgpa || 0;
        return sum + cgpa;
      }, 0) || 0;
      setAvgCGPA(total > 0 ? cgpaSum / total : 0);

      // Department-wise stats
      const deptMap = new Map<string, { total: number; placed: number }>();
      students?.forEach(student => {
        const dept = student.department || 'Unknown';
        const current = deptMap.get(dept) || { total: 0, placed: 0 };
        current.total++;
        if (placedStudentIds.has(student.id)) {
          current.placed++;
        }
        deptMap.set(dept, current);
      });

      const deptStats: DepartmentStats[] = Array.from(deptMap.entries()).map(([dept, stats]) => ({
        department: dept,
        total: stats.total,
        placed: stats.placed,
        percentage: stats.total > 0 ? (stats.placed / stats.total) * 100 : 0
      }));
      setDepartmentStats(deptStats);

      // Status distribution
      const { data: allApps, error: appsError } = await supabase
        .from('applications')
        .select('status');

      if (!appsError && allApps) {
        const statusMap = new Map<string, number>();
        allApps.forEach(app => {
          statusMap.set(app.status, (statusMap.get(app.status) || 0) + 1);
        });

        const totalApps = allApps.length;
        const stats: StatusStats[] = Array.from(statusMap.entries()).map(([status, count]) => ({
          status,
          count,
          percentage: totalApps > 0 ? (count / totalApps) * 100 : 0
        }));
        setStatusStats(stats);
      }

      // Unplaced students
      const unplaced = students?.filter(s => !placedStudentIds.has(s.id)) || [];
      setUnplacedStudents(unplaced);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Department', 'CGPA', 'Year', 'Status'];
    const rows = unplacedStudents.map(s => [
      s.name,
      s.email,
      s.department || 'N/A',
      s.student_profile?.cgpa || 'N/A',
      s.student_profile?.year || 'N/A',
      'Unplaced'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unplaced_students.csv';
    a.click();
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      APPLIED: 'bg-blue-500',
      SHORTLISTED: 'bg-purple-500',
      INTERVIEW_SCHEDULED: 'bg-amber-500',
      REJECTED: 'bg-rose-500',
      OFFERED: 'bg-emerald-500',
      ACCEPTED: 'bg-green-500'
    };
    return colors[status] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  const placementPercentage = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">Student Analytics</h1>
              <p className="text-slate-400">Comprehensive placement statistics and insights</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue rounded-lg transition-colors"
            >
              <Download size={20} />
              Export Unplaced
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Briefcase className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Placed</p>
                  <p className="text-2xl font-bold">{placedStudents}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Placement Rate</p>
                  <p className="text-2xl font-bold">{placementPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <BarChart3 className="text-amber-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg CGPA</p>
                  <p className="text-2xl font-bold">{avgCGPA.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Department-wise Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-neon-blue" />
                Department-wise Placement
              </h2>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <span className="text-sm text-slate-400">
                        {dept.placed}/{dept.total} ({dept.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Application Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-neon-purple" />
                Application Status Distribution
              </h2>
              <div className="space-y-4">
                {statusStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium capitalize">
                        {stat.status.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="text-sm text-slate-400">
                        {stat.count} ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className={`${getStatusColor(stat.status)} h-2 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Unplaced Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-6">Unplaced Students ({unplacedStudents.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">CGPA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {unplacedStudents.map((student, index) => (
                    <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4 text-slate-400">{student.email}</td>
                      <td className="py-3 px-4">{student.department || 'N/A'}</td>
                      <td className="py-3 px-4">{student.student_profile?.cgpa || 'N/A'}</td>
                      <td className="py-3 px-4">{student.student_profile?.year || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {unplacedStudents.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>All students have been placed! 🎉</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentAnalyticsPage;
