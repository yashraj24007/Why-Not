import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ApplyModal from '../components/ApplyModal';
import PageTransition from '../components/PageTransition';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingGrid } from '../components/LoadingSkeleton';

const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    minStipend: 0
  });
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    fetchOpportunities();
  }, [debouncedSearch, filters.type, filters.location, filters.minStipend]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities({
        search: debouncedSearch,
        type: filters.type as any,
        location: filters.location,
        minStipend: filters.minStipend
      });
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (opp: any) => {
    setSelectedOpp(opp);
    setIsApplyModalOpen(true);
  };

  const calculateMatch = (opp: any) => {
    if (!user || !user.skills) return 0;
    const requiredSkills = opp.required_skills || [];
    if (requiredSkills.length === 0) return 100;
    
    const userSkillNames = user.skills
      .filter((s: any) => s && s.name)
      .map((s: any) => s.name.toLowerCase());
    const matchCount = requiredSkills
      .filter((s: any) => s && s.name && userSkillNames.includes(s.name.toLowerCase()))
      .length;
    
    return Math.round((matchCount / requiredSkills.length) * 100);
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 space-y-6">
            <div className="glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Filter className="w-5 h-5" />
                <h3 className="font-bold">Filters</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="PLACEMENT">Placement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangalore"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Min Stipend</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                    value={filters.minStipend}
                    onChange={(e) => setFilters({...filters, minStipend: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by role, company, or skills..." 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {loading ? (
                <LoadingGrid count={6} type="card" />
              ) : opportunities.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-xl">
                  <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Opportunities Found</h3>
                  <p className="text-slate-400 mb-6">No opportunities match your current filters.</p>
                  <p className="text-sm text-slate-500">Try adjusting your filters or check the Settings page to seed sample data.</p>
                </div>
              ) : (
                opportunities.map((opp) => {
                  const matchScore = calculateMatch(opp);
                  return (
                    <motion.div 
                      key={opp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-6 rounded-xl hover:bg-white/[0.05] transition-all border border-white/5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded border ${
                              opp.type === 'INTERNSHIP' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>
                              {opp.type}
                            </span>
                          </div>
                          <p className="text-slate-400 text-lg mb-2">{opp.company_name}</p>
                          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{opp.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {opp.location || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" /> ₹{opp.stipend_min?.toLocaleString()} - ₹{opp.stipend_max?.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" /> {opp.duration || 'Full Time'}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {opp.required_skills?.map((skill: any) => (
                              <span key={skill.name} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`text-lg font-bold ${matchScore >= 80 ? 'text-green-400' : matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {matchScore}% Match
                            </div>
                          </div>
                          <button 
                            onClick={() => handleApplyClick(opp)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <ApplyModal 
          isOpen={isApplyModalOpen} 
          onClose={() => setIsApplyModalOpen(false)} 
          opportunity={selectedOpp} 
        />
      </div>
    </PageTransition>
  );
};

export default OpportunitiesPage;
