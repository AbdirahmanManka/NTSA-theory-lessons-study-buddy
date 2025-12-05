import React, { useState, useEffect } from 'react';
import { NTSA_TOPICS, AppState, Topic, QuizQuestion } from './types';
import { generateTopicContent, generateQuizQuestions, searchTopics } from './services/geminiService';
import ChatWidget from './components/ChatWidget';
import MarkdownRenderer from './components/MarkdownRenderer';
import { BookOpen, Search, GraduationCap, ChevronLeft, RefreshCw, CheckCircle, XCircle, Home, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppState>(AppState.HOME);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quiz State 
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveTab(AppState.TOPIC_VIEW);
    setLoading(true);
    const generated = await generateTopicContent(topic.title);
    setContent(generated);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveTab(AppState.SEARCH);
    setLoading(true);
    const result = await searchTopics(searchQuery);
    setContent(result);
    setLoading(false);
  };

  const startQuiz = async (difficulty: 'easy' | 'hard') => {
    setLoading(true);
    setQuizQuestions([]);
    setScore(0);
    setCurrentQuestionIdx(0);
    setQuizCompleted(false);
    setShowAnswer(false);
    
    // If inside a topic, quiz on that topic. Else general exam.
    const topicName = selectedTopic ? selectedTopic.title : "General Driving Knowledge";
    const questions = await generateQuizQuestions(topicName, difficulty);
    
    setQuizQuestions(questions);
    setActiveTab(AppState.QUIZ);
    setLoading(false);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (showAnswer) return;
    
    if (optionIdx === quizQuestions[currentQuestionIdx].correctAnswerIndex) {
      setScore(s => s + 1);
    }
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(p => p + 1);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* Hero */}
      <div className="text-center mb-12 space-y-4 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight break-words">
          Master the <span className="text-primary">Kenyan Road</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto break-words">
          Your AI-powered study buddy for the NTSA driving curriculum. Summarized notes, instant answers, and practice quizzes.
        </p>
        <div className="flex justify-center gap-4 mt-6 px-4">
          <button 
            onClick={() => { setSelectedTopic(null); startQuiz('easy'); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-3 rounded-full font-medium transition shadow-lg shadow-blue-200 text-sm sm:text-base"
          >
            <GraduationCap size={20} />
            <span className="whitespace-nowrap">Take Full Mock Exam</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BookOpen size={20} className="text-primary" />
        Curriculum Topics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {NTSA_TOPICS.map((topic) => (
          <div 
            key={topic.id}
            onClick={() => handleTopicClick(topic)}
            className="group bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center text-center gap-3 overflow-x-hidden"
          >
            {topic.icon === 'steering-wheel' ? (
              <svg 
                className="w-16 h-16 group-hover:scale-110 transition-transform duration-300 text-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2" />
                <line x1="12" y1="3" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="21" />
                <line x1="3" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="21" y2="12" />
                <line x1="5.64" y1="5.64" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="18.36" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="16.24" y2="7.76" />
                <line x1="7.76" y1="16.24" x2="5.64" y2="18.36" />
              </svg>
            ) : topic.icon.startsWith('fa-') ? (
              <i className={`fas ${topic.icon} text-4xl group-hover:scale-110 transition-transform duration-300 text-primary`}></i>
            ) : (
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
            )}
            <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors break-words overflow-wrap-anywhere">{topic.title}</h3>
            <span className="text-xs text-slate-400 font-medium bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">Read Notes</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 overflow-x-hidden">
      <button 
        onClick={() => setActiveTab(AppState.HOME)}
        className="flex items-center gap-1 text-slate-500 hover:text-primary mb-6 transition"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 overflow-x-hidden">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {selectedTopic?.icon === 'steering-wheel' ? (
                  <svg 
                    className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 text-primary" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="2" />
                    <line x1="12" y1="3" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="21" />
                    <line x1="3" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="21" y2="12" />
                    <line x1="5.64" y1="5.64" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="18.36" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="16.24" y2="7.76" />
                    <line x1="7.76" y1="16.24" x2="5.64" y2="18.36" />
                  </svg>
                ) : selectedTopic?.icon && selectedTopic.icon.startsWith('fa-') ? (
                  <i className={`fas ${selectedTopic.icon} text-4xl flex-shrink-0 text-primary`}></i>
                ) : (
                  <span className="text-4xl flex-shrink-0">{selectedTopic?.icon || '🔍'}</span>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 break-words overflow-wrap-anywhere">{selectedTopic?.title || 'Search Results'}</h1>
            </div>
            {selectedTopic && (
                <button 
                    onClick={() => startQuiz('easy')}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex-shrink-0 whitespace-nowrap"
                >
                    <GraduationCap size={16} />
                    <span className="hidden sm:inline">Test This Topic</span>
                    <span className="sm:hidden">Test</span>
                </button>
            )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 min-h-[400px] overflow-x-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <RefreshCw className="animate-spin text-primary" size={40} />
              <p className="text-slate-400 animate-pulse">Consulting the AI Instructor...</p>
            </div>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 overflow-x-hidden">
        <div className="mb-6 flex justify-between items-center gap-2 overflow-x-hidden">
            <button 
                onClick={() => setActiveTab(selectedTopic ? AppState.TOPIC_VIEW : AppState.HOME)}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm sm:text-base whitespace-nowrap"
            >
                <XCircle size={18} /> <span className="hidden sm:inline">Quit Quiz</span>
            </button>
            <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0">
                Question {currentQuestionIdx + 1}/{quizQuestions.length}
            </span>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <RefreshCw className="animate-spin text-primary" size={40} />
             <p className="text-slate-400 text-center px-4">Generating customized questions...</p>
           </div>
        ) : quizCompleted ? (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center space-y-6 animate-fade-in-up overflow-x-hidden">
                <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                    <GraduationCap size={48} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Quiz Completed!</h2>
                <div className="text-4xl sm:text-5xl font-bold text-primary">{score} / {quizQuestions.length}</div>
                <p className="text-slate-500 px-4 break-words">
                    {score / quizQuestions.length > 0.7 ? "Excellent driving! You're ready for the road." : "Keep studying, you can do better!"}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 px-4">
                    <button onClick={() => startQuiz('easy')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition w-full sm:w-auto">Try Again</button>
                    <button onClick={() => setActiveTab(AppState.HOME)} className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-6 py-2 rounded-lg transition w-full sm:w-auto">Home</button>
                </div>
            </div>
        ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 overflow-x-hidden">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6 leading-relaxed break-words overflow-wrap-anywhere">
                    {quizQuestions[currentQuestionIdx]?.question}
                </h3>
                
                <div className="space-y-3">
                    {quizQuestions[currentQuestionIdx]?.options.map((opt, idx) => {
                        let btnClass = "w-full text-left p-3 sm:p-4 rounded-xl border border-gray-200 transition-all flex justify-between items-center gap-2 min-w-0 ";
                        if (showAnswer) {
                            if (idx === quizQuestions[currentQuestionIdx].correctAnswerIndex) {
                                btnClass += "bg-green-50 border-green-500 text-green-700 font-medium";
                            } else if (idx !== quizQuestions[currentQuestionIdx].correctAnswerIndex && 
                                // Logic check: we don't track which wrong answer user clicked for simple UI, 
                                // but ideally we would highlight the wrong selected one too. 
                                // For simplicity, we just highlight correct answer.
                                false
                            ) {
                                btnClass += "bg-red-50 border-red-200 text-red-700";
                            } else {
                                btnClass += "opacity-50";
                            }
                        } else {
                            btnClass += "hover:bg-slate-50 hover:border-primary/50 text-slate-700";
                        }

                        return (
                            <button 
                                key={idx} 
                                onClick={() => handleQuizAnswer(idx)}
                                disabled={showAnswer}
                                className={btnClass}
                            >
                                <span className="break-words overflow-wrap-anywhere flex-1 min-w-0">{opt}</span>
                                {showAnswer && idx === quizQuestions[currentQuestionIdx].correctAnswerIndex && (
                                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {showAnswer && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in overflow-x-hidden">
                        <p className="text-slate-600 mb-4 bg-blue-50 p-4 rounded-lg text-sm break-words overflow-wrap-anywhere">
                            <span className="font-bold text-blue-700 block mb-1">Explanation:</span>
                            {quizQuestions[currentQuestionIdx].explanation}
                        </p>
                        <button 
                            onClick={nextQuestion}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium transition"
                        >
                            {currentQuestionIdx === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bg-layout overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2 min-w-0">
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => setActiveTab(AppState.HOME)}
          >
            <div className="bg-primary text-white p-1.5 rounded-lg">
                <FileText size={20} />
            </div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block whitespace-nowrap">NTSA Study Buddy</span>
          </div>

          <div className="flex-1 max-w-md mx-2 sm:mx-4 min-w-0">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all min-w-0"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
             <button 
                onClick={() => setActiveTab(AppState.HOME)}
                className={`p-2 rounded-lg transition ${activeTab === AppState.HOME ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-gray-100'}`}
             >
                <Home size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === AppState.HOME && renderHome()}
        {(activeTab === AppState.TOPIC_VIEW || activeTab === AppState.SEARCH) && renderContent()}
        {activeTab === AppState.QUIZ && renderQuiz()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-slate-400 text-sm px-4 overflow-x-hidden">
        <p className="break-words">© {new Date().getFullYear()} NTSA Driving Instructor AI. Designed for Kenyan Students.</p>
      </footer>

      {/* Chatbot */}
      <ChatWidget />
    </div>
  );
};

export default App;