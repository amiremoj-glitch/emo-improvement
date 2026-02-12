
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, Book, Todo, Goal, Message, Routine, AppSettings } from './types';
import { ICONS, MOTIVATIONAL_QUOTES, TRANSLATIONS } from './constants';
import { Layout } from './components/Layout';
import { BooksView } from './components/BooksView';
import { TodoView } from './components/TodoView';
import { GoalsView } from './components/GoalsView';
import { RoutineView } from './components/RoutineView';
import { SettingsView } from './components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { chatWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('menu');
  const [currentView, setCurrentView] = useState<'main' | 'books' | 'todo' | 'goals' | 'routine'>('main');
  
  // Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('emo_settings');
    return saved ? JSON.parse(saved) : { language: 'fa', theme: 'light', notifications: true };
  });

  const t = TRANSLATIONS[settings.language];

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('emo_books');
    return saved ? JSON.parse(saved) : [];
  });
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('emo_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('emo_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('emo_routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const qList = MOTIVATIONAL_QUOTES[settings.language];
    setQuote(qList[Math.floor(Math.random() * qList.length)]);
  }, [settings.language]);

  useEffect(() => {
    localStorage.setItem('emo_settings', JSON.stringify(settings));
    localStorage.setItem('emo_books', JSON.stringify(books));
    localStorage.setItem('emo_todos', JSON.stringify(todos));
    localStorage.setItem('emo_goals', JSON.stringify(goals));
    localStorage.setItem('emo_routines', JSON.stringify(routines));
  }, [settings, books, todos, goals, routines]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);
    const response = await chatWithGemini(newMessages);
    setMessages([...newMessages, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const renderMenuView = () => {
    if (currentView === 'books') return (
      <BooksView 
        books={books} 
        onBack={() => setCurrentView('main')}
        onAdd={(t, a, s) => setBooks([...books, { id: Date.now().toString(), title: t, author: a, status: s }])}
        onDelete={(id) => setBooks(books.filter(b => b.id !== id))}
        onToggle={(id) => setBooks(books.map(b => b.id === id ? { ...b, status: b.status === 'reading' ? 'finished' : 'reading' } : b))}
      />
    );
    if (currentView === 'todo') return (
      <TodoView 
        todos={todos} 
        onBack={() => setCurrentView('main')}
        onAdd={(t) => setTodos([...todos, { id: Date.now().toString(), text: t, completed: false }])}
        onDelete={(id) => setTodos(todos.filter(todo => todo.id !== id))}
        onToggle={(id) => setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))}
      />
    );
    if (currentView === 'goals') return (
      <GoalsView 
        goals={goals} 
        language={settings.language}
        theme={settings.theme}
        onBack={() => setCurrentView('main')}
        onAdd={(t, ty) => setGoals([...goals, { id: Date.now().toString(), text: t, type: ty, reached: false }])}
        onDelete={(id) => setGoals(goals.filter(g => g.id !== id))}
        onToggle={(id) => setGoals(goals.map(g => g.id === id ? { ...g, reached: !g.reached } : g))}
      />
    );
    if (currentView === 'routine') return (
      <RoutineView 
        routines={routines}
        language={settings.language}
        theme={settings.theme}
        onBack={() => setCurrentView('main')}
        onAdd={(t) => setRoutines([...routines, { id: Date.now().toString(), text: t, completed: false }])}
        onDelete={(id) => setRoutines(routines.filter(r => r.id !== id))}
        onToggle={(id) => setRoutines(routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r))}
      />
    );

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <section className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-xl text-white ${settings.theme === 'dark' ? 'bg-indigo-900/60' : 'bg-indigo-600'}`}>
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t.dailyWisdom}</span>
            <blockquote className="mt-4 text-xl font-light italic leading-relaxed">
              « {quote.text} »
            </blockquote>
            <cite className="block mt-4 text-sm font-semibold opacity-70">— {quote.author}</cite>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <MenuCard 
            icon={<ICONS.Books className="w-7 h-7" />}
            title={t.books}
            description={`${books.filter(b => b.status === 'reading').length} ${t.reading}`}
            onClick={() => setCurrentView('books')}
            color={settings.theme === 'dark' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' : 'bg-amber-50 text-amber-600 border-amber-100'}
          />
          <MenuCard 
            icon={<ICONS.TodoList className="w-7 h-7" />}
            title={t.tasks}
            description={`${todos.filter(t => !t.completed).length} ${t.pending}`}
            onClick={() => setCurrentView('todo')}
            color={settings.theme === 'dark' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}
          />
          <MenuCard 
            icon={<ICONS.Routine className="w-7 h-7" />}
            title={t.routine}
            description={`${routines.filter(r => !r.completed).length} ${t.pending}`}
            onClick={() => setCurrentView('routine')}
            color={settings.theme === 'dark' ? 'bg-purple-900/20 text-purple-500 border-purple-900/30' : 'bg-purple-50 text-purple-600 border-purple-100'}
          />
          <MenuCard 
            icon={<ICONS.Goals className="w-7 h-7" />}
            title={t.goals}
            description={`${goals.filter(g => g.reached).length} ${t.reached}`}
            onClick={() => setCurrentView('goals')}
            color={settings.theme === 'dark' ? 'bg-indigo-900/20 text-indigo-500 border-indigo-900/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}
          />
        </section>
      </div>
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      language={settings.language}
      theme={settings.theme}
    >
      {activeTab === 'menu' && renderMenuView()}
      {activeTab === 'assistant' && (
        <div className="flex flex-col h-[calc(100vh-14rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                  <ICONS.Assistant className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">{settings.language === 'fa' ? 'چطور می‌تونم کمکت کنم؟' : 'How can I help you?'}</h3>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? (settings.language === 'fa' ? 'justify-start' : 'justify-end') : (settings.language === 'fa' ? 'justify-end' : 'justify-start')}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : settings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border text-slate-700 shadow-sm'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && <div className="flex justify-end"><div className="p-4 bg-white dark:bg-slate-800 rounded-2xl animate-pulse">...</div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={settings.language === 'fa' ? 'چیزی بپرس...' : 'Ask something...'}
              className={`flex-1 p-4 rounded-2xl outline-none border focus:ring-2 ring-indigo-500/20 ${settings.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}
            />
            <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg">
              <ICONS.Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>
        </div>
      )}
      {activeTab === 'calendar' && <CalendarView language={settings.language} theme={settings.theme} />}
      {activeTab === 'settings' && (
        <SettingsView 
          settings={settings} 
          updateSettings={(s) => setSettings({...settings, ...s})} 
          onReset={() => {
            if(confirm('Are you sure?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        />
      )}
      {activeTab === 'about' && (
        <div className="space-y-6 text-center">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl text-white">
             <span className="text-4xl font-bold">EI</span>
          </div>
          <h2 className="text-3xl font-black">Emo Improvement</h2>
          <p className="text-slate-500 font-medium">
            {settings.language === 'fa' 
              ? 'این اپلیکیشن همراه شما در مسیر رشد و تعالی است.' 
              : 'Your ultimate companion for personal growth and excellence.'}
          </p>
        </div>
      )}
    </Layout>
  );
};

const MenuCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; color: string }> = ({ 
  icon, title, description, onClick, color 
}) => (
  <button onClick={onClick} className={`p-5 rounded-[2rem] border transition-all text-right group hover:scale-[1.02] hover:shadow-lg active:scale-95 ${color}`}>
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-1">{title}</h3>
    <p className="text-xs opacity-70 font-medium">{description}</p>
  </button>
);

export default App;
