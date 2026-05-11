import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Brain, TrendingUp, BookOpen, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Layout/Navbar';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { chats, loadChats, createChat, deleteChat, loadingChats } = useContext(ChatContext);
  const [stats, setStats] = useState({ totalChats: 0, totalDoubts: 0, subjectBreakdown: {} });
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await chatAPI.getStats();
      setStats(data.stats);
    } catch {
      toast.error('Failed to load stats');
    }
  };

  const handleNewChat = async () => {
    const newChat = await createChat();
    if (newChat) navigate(`/chat/${newChat._id}`);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    await deleteChat(chatId);
    loadStats();
  };

  const subjectColors = {
    Mathematics: 'bg-blue-100 text-blue-700',
    Physics: 'bg-purple-100 text-purple-700',
    Chemistry: 'bg-green-100 text-green-700',
    Biology: 'bg-emerald-100 text-emerald-700',
    History: 'bg-amber-100 text-amber-700',
    English: 'bg-pink-100 text-pink-700',
    General: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to solve some doubts today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
                <p className="text-sm text-gray-500">Conversations</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoubts}</p>
                <p className="text-sm text-gray-500">Doubts Solved</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.subjectBreakdown).length || 0}</p>
                <p className="text-sm text-gray-500">Subjects</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round((stats.totalDoubts / (stats.totalChats || 1)) * 10) / 10}</p>
                <p className="text-sm text-gray-500">Avg per Chat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        {Object.keys(stats.subjectBreakdown).length > 0 && (
          <div className="card mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Subject Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.subjectBreakdown).map(([subject, count]) => (
                <span key={subject} className={`px-3 py-1 rounded-full text-xs font-medium ${subjectColors[subject] || 'bg-gray-100 text-gray-700'}`}>
                  {subject}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* New Chat Button */}
        <button onClick={handleNewChat} className="btn-primary w-full sm:w-auto mb-6">
          <Plus className="w-5 h-5" />
          New Conversation
        </button>

        {/* Conversations List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h2>
          
          {loadingChats ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto animate-pulse">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-500 mt-3">Loading conversations...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start by asking your first doubt!</p>
              <button onClick={handleNewChat} className="btn-primary">
                Start Learning
              </button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="card p-4 cursor-pointer hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subjectColors[chat.subject] || 'bg-gray-100 text-gray-700'}`}>
                        {chat.subject}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {timeAgo(chat.lastActivity)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{chat.title}</h3>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{chat.messageCount} messages</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}