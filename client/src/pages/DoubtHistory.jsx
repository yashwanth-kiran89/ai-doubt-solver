import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ThumbsUp, ThumbsDown, Brain, Calendar, Filter, X } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';
import toast from 'react-hot-toast';

const API_BASE = '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function DoubtHistory() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', difficulty: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoubts();
  }, [filters]);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      
      const { data } = await api.get(`/doubts/history?${params}`);
      setDoubts(data);
    } catch (error) {
      toast.error('Failed to load doubt history');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (id, isHelpful) => {
    try {
      await api.patch(`/doubts/${id}/helpful`, { isHelpful });
      toast.success('Thanks for your feedback!');
      fetchDoubts();
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  const deleteDoubt = async (id) => {
    if (!confirm('Delete this doubt?')) return;
    try {
      await api.delete(`/doubts/${id}`);
      toast.success('Doubt deleted');
      fetchDoubts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const subjects = [...new Set(doubts.map(d => d.subject).filter(Boolean))];

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doubt History</h1>
            <p className="text-gray-500 mt-1">All your solved doubts in one place</p>
          </div>
          <Link to="/ask-doubt" className="btn-primary">
            <BookOpen className="w-4 h-4" />
            New Doubt
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doubts..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-9"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.subject || filters.difficulty) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="input-field w-auto min-w-[140px] text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="input-field w-auto min-w-[140px] text-sm"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {(filters.subject || filters.difficulty) && (
                <button
                  onClick={() => setFilters({ subject: '', difficulty: '', search: '' })}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Doubts List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto animate-pulse">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-500 mt-3">Loading your doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No doubts yet</h3>
            <p className="text-gray-500 text-sm mb-4">Ask your first doubt to get started!</p>
            <Link to="/ask-doubt" className="btn-primary inline-flex">
              Ask a Doubt
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt._id} className="card hover:shadow-md transition-all duration-200">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {doubt.subject}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[doubt.difficulty]}`}>
                      {doubt.difficulty}
                    </span>
                    {doubt.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => markHelpful(doubt._id, true)}
                        className={`p-1 rounded ${doubt.isHelpful === true ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markHelpful(doubt._id, false)}
                        className={`p-1 rounded ${doubt.isHelpful === false ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteDoubt(doubt._id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{doubt.question}</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700 font-medium mb-1">Answer:</p>
                  <p className="text-sm text-gray-600">{doubt.answer}</p>
                  {doubt.explanation && (
                    <>
                      <p className="text-sm text-gray-700 font-medium mt-3 mb-1">Explanation:</p>
                      <p className="text-sm text-gray-600">{doubt.explanation}</p>
                    </>
                  )}
                </div>

                {doubt.followUps?.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2 border-blue-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Follow-ups:</p>
                    {doubt.followUps.map((f, i) => (
                      <div key={i} className="mb-2">
                        <p className="text-sm text-gray-700">Q: {f.question}</p>
                        <p className="text-sm text-gray-500 ml-2">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {timeAgo(doubt.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}