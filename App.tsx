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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
          Master the <span className="text-primary">Kenyan Road</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Your AI-powered study buddy for the NTSA driving curriculum. Summarized notes, instant answers, and practice quizzes.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => { setSelectedTopic(null); startQuiz('easy'); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-medium transition shadow-lg shadow-blue-200"
          >
            <GraduationCap size={20} />
            Take Full Mock Exam
          </button>
        </div>
      </div>

      {/* Grid */}
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BookOpen size={20} className="text-primary" />
        Curriculum Topics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {NTSA_TOPICS.map((topic) => (
          <div 
            key={topic.id}
            onClick={() => handleTopicClick(topic)}
            className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center text-center gap-3"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
            <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{topic.title}</h3>
            <span className="text-xs text-slate-400 font-medium bg-gray-50 px-2 py-1 rounded-full">Read Notes</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => setActiveTab(AppState.HOME)}
        className="flex items-center gap-1 text-slate-500 hover:text-primary mb-6 transition"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedTopic?.icon || '🔍'}</span>
                <h1 className="text-2xl font-bold text-slate-800">{selectedTopic?.title || 'Search Results'}</h1>
            </div>
            {selectedTopic && (
                <button 
                    onClick={() => startQuiz('easy')}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <GraduationCap size={16} />
                    Test This Topic
                </button>
            )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 min-h-[400px]">
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
    <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
            <button 
                onClick={() => setActiveTab(selectedTopic ? AppState.TOPIC_VIEW : AppState.HOME)}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
                <XCircle size={18} /> Quit Quiz
            </button>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Question {currentQuestionIdx + 1}/{quizQuestions.length}
            </span>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <RefreshCw className="animate-spin text-primary" size={40} />
             <p className="text-slate-400">Generating customized questions...</p>
           </div>
        ) : quizCompleted ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center space-y-6 animate-fade-in-up">
                <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                    <GraduationCap size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Quiz Completed!</h2>
                <div className="text-5xl font-bold text-primary">{score} / {quizQuestions.length}</div>
                <p className="text-slate-500">
                    {score / quizQuestions.length > 0.7 ? "Excellent driving! You're ready for the road." : "Keep studying, you can do better!"}
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={() => startQuiz('easy')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition">Try Again</button>
                    <button onClick={() => setActiveTab(AppState.HOME)} className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-6 py-2 rounded-lg transition">Home</button>
                </div>
            </div>
        ) : (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
                    {quizQuestions[currentQuestionIdx]?.question}
                </h3>
                
                <div className="space-y-3">
                    {quizQuestions[currentQuestionIdx]?.options.map((opt, idx) => {
                        let btnClass = "w-full text-left p-4 rounded-xl border border-gray-200 transition-all flex justify-between items-center ";
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
                                <span>{opt}</span>
                                {showAnswer && idx === quizQuestions[currentQuestionIdx].correctAnswerIndex && (
                                    <CheckCircle size={20} className="text-green-600" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {showAnswer && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                        <p className="text-slate-600 mb-4 bg-blue-50 p-4 rounded-lg text-sm">
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
    <div className="min-h-screen flex flex-col font-sans bg-bg-layout">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab(AppState.HOME)}
          >
            <div className="bg-primary text-white p-1.5 rounded-lg">
                <FileText size={20} />
            </div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">NTSA Study Buddy</span>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. 'Overtaking rules')..."
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
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
      <main className="flex-1">
        {activeTab === AppState.HOME && renderHome()}
        {(activeTab === AppState.TOPIC_VIEW || activeTab === AppState.SEARCH) && renderContent()}
        {activeTab === AppState.QUIZ && renderQuiz()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} NTSA Driving Instructor AI. Designed for Kenyan Students.</p>
      </footer>

      {/* Chatbot */}
      <ChatWidget />
    </div>
  );
};

export default App;