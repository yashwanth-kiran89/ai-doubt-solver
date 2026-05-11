import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image, Upload, X, Loader2, Brain, Mic, FileText } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import toast from 'react-hot-toast';
import { doubtAPI } from '../services/api';

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science'];

export default function AskDoubt() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('General');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() && !imageFile) {
      toast.error('Please enter a question or upload an image');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (imageFile) {
        // For image doubts, use FormData with the doubt API
        const formData = new FormData();
        formData.append('image', imageFile);
        if (question.trim()) formData.append('question', question);
        if (subject) formData.append('subject', subject);
        
        await doubtAPI.askWithImage(formData);
        
        toast.success('Doubt solved!');
        navigate('/doubt-history');
      } else {
        // Text-only doubt
        await doubtAPI.ask({
          question: question.trim(),
          subject,
        });
        
        toast.success('Doubt solved!');
        navigate('/doubt-history');
      }
    } catch (error) {
      console.error('[ASKDOUBT] Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to solve doubt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ask a Doubt</h1>
          <p className="text-gray-500 mt-1">Single question • Instant answer • Saved for later</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your doubt here..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Image (Optional)</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" 
                    onChange={handleImageSelect} 
                    className="hidden" 
                  />
                  {imageFile && (
                    <span className="text-sm text-green-600">✅ Image ready</span>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-lg border border-gray-200 object-contain" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">AI will analyze the image along with your question</p>
              </div>

              <button type="submit" disabled={submitting || (!question.trim() && !imageFile)} className="btn-primary w-full py-3">
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Solving...</>
                ) : (
                  <><Send className="w-5 h-5" /> Get Answer</>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
              <Brain className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">About Doubts</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">• Single question → Direct answer</li>
                <li className="flex gap-2">• Saved in Doubt History</li>
                <li className="flex gap-2">• Rate answers as helpful/not</li>
                <li className="flex gap-2">• Review anytime</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Need Discussion?</h3>
              <p className="text-sm text-gray-600 mb-3">For back-and-forth conversation, use the Chat feature.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full text-sm"
              >
                Go to Dashboard → New Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}