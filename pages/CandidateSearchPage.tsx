import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Mail, Briefcase } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingGrid } from '../components/LoadingSkeleton';

const CandidateSearchPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: 'ALL',
    minCGPA: 0,
    year: 'ALL',
    skills: [] as string[]
  });

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [debouncedSearch, filters, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          student_profile:student_profiles(*)
        `)
        .eq('role', 'STUDENT');

      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Search by name or email - now using debounced search
    if (debouncedSearch) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Filter by department
    if (filters.department !== 'ALL') {
      filtered = filtered.filter(s => s.department === filters.department);
    }

    // Filter by CGPA
    if (filters.minCGPA > 0) {
      filtered = filtered.filter(s => (s.student_profile?.cgpa || 0) >= filters.minCGPA);
    }

    // Filter by year
    if (filters.year !== 'ALL') {
      filtered = filtered.filter(s => s.student_profile?.year === parseInt(filters.year));
    }

    setFilteredStudents(filtered);
  };

  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)));

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-8 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 gradient-text">Browse Candidates</h1>
              <p className="text-slate-400">Find talented students for your organization</p>
            </div>
            <LoadingGrid count={9} type="card" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Browse Candidates</h1>
            <p className="text-slate-400">Find talented students for your organization</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Min CGPA */}
              <div>
                <label className="block text-sm font-medium mb-2">Min CGPA</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minCGPA}
                  onChange={(e) => setFilters({ ...filters, minCGPA: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                >
                  <option value="ALL">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Showing {filteredStudents.length} of {students.length} candidates
              </p>
            </div>
          </div>

          {/* Student Cards */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No candidates match your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6 hover:border-neon-blue/50 transition-colors"
                >
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg font-bold">
                        {student.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-slate-400">{student.department}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">CGPA:</span>
                      <span className="font-medium">{student.student_profile?.cgpa || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Year:</span>
                      <span>{student.student_profile?.year || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Semester:</span>
                      <span>{student.student_profile?.semester || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {student.student_profile?.skills && student.student_profile.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.student_profile.skills.slice(0, 3).map((skill: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-neon-blue/10 text-neon-blue text-xs rounded-full border border-neon-blue/20"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {student.student_profile.skills.length > 3 && (
                          <span className="px-2 py-1 text-slate-400 text-xs">
                            +{student.student_profile.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${student.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
                    >
                      <Mail size={16} />
                      Contact
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue rounded-lg transition-colors text-sm">
                      <Briefcase size={16} />
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CandidateSearchPage;
