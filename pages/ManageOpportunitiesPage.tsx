import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Edit, XCircle, Eye } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

const ManageOpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user, filter]);

  const fetchOpportunities = async () => {
    try {
      let query = supabase
        .from('opportunities')
        .select('*')
        .eq('posted_by', user!.id)
        .order('created_at', { ascending: false });

      if (filter !== 'ALL') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to close this opportunity?')) return;

    try {
      await supabase
        .from('opportunities')
        .update({ status: 'CLOSED' })
        .eq('id', id);
      
      fetchOpportunities();
    } catch (error) {
      console.error('Error closing opportunity:', error);
    }
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Opportunities</h1>
          <p className="text-slate-400">View and manage all posted opportunities</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'ACTIVE', 'CLOSED', 'DRAFT'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === status
                  ? 'bg-neon-blue text-black font-medium'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-xl">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Opportunities Found</h3>
            <p className="text-slate-400">You haven't posted any opportunities yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{opp.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        opp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        opp.status === 'CLOSED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {opp.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        opp.type === 'INTERNSHIP' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-slate-400 mb-4">{opp.company_name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>📍 {opp.location || 'Remote'}</span>
                      <span>💰 ₹{opp.stipend_min?.toLocaleString()} - ₹{opp.stipend_max?.toLocaleString()}</span>
                      <span>📅 Posted {new Date(opp.created_at).toLocaleDateString()}</span>
                      {opp.deadline && (
                        <span className="text-amber-400">⏰ Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors" title="View Details">
                      <Eye size={18} />
                    </button>
                    {opp.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCloseOpportunity(opp.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Close Opportunity"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ManageOpportunitiesPage;
