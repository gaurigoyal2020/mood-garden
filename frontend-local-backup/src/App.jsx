import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const MoodGarden = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [garden, setGarden] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  const moods = [
    { id: 'amazing', emoji: '✨', label: 'Amazing', color: '#ffd4e5', plant: '🌸' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#ffe4b5', plant: '🌻' },
    { id: 'okay', emoji: '😌', label: 'Okay', color: '#c8e6f5', plant: '🌿' },
    { id: 'sad', emoji: '😔', label: 'Sad', color: '#d8d0f0', plant: '🍄' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#ffd4f0', plant: '🌵' }
  ];

  useEffect(() => {
    // Mock data for demo
    setGarden([
      { plant: '🌸', mood: 'amazing', date: new Date() },
      { plant: '🌻', mood: 'happy', date: new Date() },
      { plant: '🌿', mood: 'okay', date: new Date() },
      { plant: '🌸', mood: 'amazing', date: new Date() },
      { plant: '🍄', mood: 'sad', date: new Date() },
    ]);
    setHistory([
      { plant: '🌸', mood: 'amazing', date: new Date(), journal: 'Had a wonderful day!' },
      { plant: '🌻', mood: 'happy', date: new Date(Date.now() - 86400000), journal: 'Great weather today' },
    ]);
    setStreak(5);
  }, []);

  const handleSubmit = () => {
    if (!selectedMood) return;

    const moodData = moods.find(m => m.id === selectedMood);
    
    const newEntry = {
      mood: selectedMood,
      plant: moodData.plant,
      journal: journalEntry,
      date: new Date()
    };

    setGarden([...garden, newEntry]);
    setHistory([newEntry, ...history]);
    setSelectedMood(null);
    setJournalEntry('');
    setStreak(streak + 1);
  };

  const WeatherIcon = () => {
    if (!selectedMood) return <span className="text-6xl pixel-icon float">☀️</span>;
    
    if (selectedMood === 'amazing' || selectedMood === 'happy') {
      return <span className="text-6xl pixel-icon float">☀️</span>;
    } else if (selectedMood === 'sad') {
      return <span className="text-6xl pixel-icon float">🌧️</span>;
    } else if (selectedMood === 'anxious') {
      return <span className="text-6xl pixel-icon float">☁️</span>;
    }
    return <span className="text-6xl pixel-icon float">⛅</span>;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{
      background: 'linear-gradient(180deg, #a8d5e2 0%, #f9e4d4 50%, #c8e6c9 100%)',
      imageRendering: 'pixelated'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3 pixel-title">
            <span className="text-4xl pixel-icon">🌺</span>
            <h1 className="text-4xl sm:text-5xl font-bold pixel-text" style={{
              color: '#4a3f35',
              textShadow: '3px 3px 0 #8b7355'
            }}>
              Mood Garden
            </h1>
            <span className="text-4xl pixel-icon">✨</span>
          </div>
          <p className="pixel-text text-lg" style={{ color: '#6b5b4f' }}>
            Grow your emotions into a beautiful garden
          </p>
          <div className="mt-4 inline-block pixel-border pixel-shadow bg-[#f8e8d8] px-6 py-3">
            <span className="pixel-text text-xl" style={{ color: '#d35400' }}>
              🔥 Streak: {streak} days
            </span>
          </div>
        </div>

        {/* Weather Display */}
        <div className="flex justify-center mb-6">
          <WeatherIcon />
        </div>

        {/* Mood Selection */}
        <div className="pixel-border pixel-shadow bg-[#f8e8d8] p-6 mb-6">
          <h2 className="pixel-text text-2xl font-bold mb-4 text-center" style={{ color: '#4a3f35' }}>
            How are you feeling today?
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {moods.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 pixel-border transition-all transform hover:scale-105 ${
                  selectedMood === mood.id 
                    ? 'pixel-shadow-selected scale-105' 
                    : 'pixel-shadow-sm'
                }`}
                style={{ backgroundColor: mood.color }}
              >
                <div className="text-4xl mb-1 pixel-icon">{mood.emoji}</div>
                <div className="pixel-text text-sm font-bold" style={{ color: '#4a3f35' }}>
                  {mood.label}
                </div>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="space-y-4 animate-fadeIn">
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="What's on your mind? (optional)"
                className="w-full p-4 pixel-border bg-white pixel-text resize-none focus:outline-none"
                style={{ 
                  color: '#4a3f35',
                  fontSize: '16px'
                }}
                rows="3"
              />
              
              <button
                onClick={handleSubmit}
                className="w-full pixel-border pixel-shadow bg-[#90c695] hover:bg-[#7ab87f] pixel-text font-bold py-4 transition-all transform hover:scale-102"
                style={{ color: '#2d4a2b' }}
              >
                Plant in Garden 🌱
              </button>
            </div>
          )}
        </div>

        {/* Garden Display */}
        <div className="pixel-border pixel-shadow bg-[#8db596] p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="pixel-text text-2xl font-bold" style={{ color: '#2d4a2b' }}>
              Your Garden
            </h2>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 pixel-border pixel-shadow-sm bg-[#f8e8d8] px-4 py-2 hover:bg-[#f1dcc6] transition-all"
            >
              <Calendar size={20} style={{ color: '#4a3f35' }} />
              <span className="pixel-text font-bold" style={{ color: '#4a3f35' }}>
                History
              </span>
            </button>
          </div>
          
          <div className="min-h-64 relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, #e8f5d0 0%, #d4e8b0 50%, #b8d89a 100%)',
            border: '4px solid #3e3228',
            position: 'relative'
          }}>
            {/* Sky background */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, #a8d5e2 0%, #e8f5d0 30%)'
            }} />
            
            {/* Decorative trees in background */}
            <div className="absolute top-0 left-0 right-0 h-16 flex justify-between px-4 opacity-40">
              <span className="text-5xl">🌳</span>
              <span className="text-5xl">🌳</span>
              <span className="text-5xl">🌳</span>
            </div>

            {/* White picket fence */}
            <div className="absolute top-12 left-0 right-0 flex justify-center">
              <div className="pixel-border bg-white px-8 py-1" style={{
                borderWidth: '3px',
                height: '4px'
              }} />
            </div>
            
            {/* Garden bed/blanket */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pixel-border bg-white p-6 shadow-lg" style={{
              width: '90%',
              maxWidth: '500px',
              background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 20px, #e8e8ff 20px, #e8e8ff 40px)',
              borderWidth: '3px'
            }}>
              {garden.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3 pixel-icon float">🌱</div>
                  <p className="pixel-text text-sm font-bold" style={{ color: '#4a3f35' }}>
                    Plant your first mood!
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-3 items-end">
                  {garden.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center"
                    >
                      <div
                        className="text-4xl transform hover:scale-125 transition-transform cursor-pointer pixel-icon float"
                        style={{ animationDelay: `${idx * 0.2}s` }}
                        title={`${item.mood} - ${new Date(item.date).toLocaleDateString()}`}
                      >
                        {item.plant}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decorative grass tufts */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4 opacity-60">
              <span className="text-2xl">🌿</span>
              <span className="text-2xl">🌿</span>
              <span className="text-2xl">🌿</span>
              <span className="text-2xl">🌿</span>
              <span className="text-2xl">🌿</span>
            </div>
          </div>
        </div>

        {/* Calendar History */}
        {showCalendar && (
          <div className="pixel-border pixel-shadow bg-[#f8e8d8] p-6 animate-fadeIn">
            <h2 className="pixel-text text-2xl font-bold mb-4" style={{ color: '#4a3f35' }}>
              Mood History
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((entry, idx) => {
                const moodData = moods.find(m => m.id === entry.mood);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 pixel-border pixel-shadow-sm hover:scale-102 transition-transform"
                    style={{ backgroundColor: moodData?.color || '#fff' }}
                  >
                    <div className="text-3xl pixel-icon">{entry.plant}</div>
                    <div className="flex-1">
                      <div className="pixel-text font-bold" style={{ color: '#4a3f35' }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      {entry.journal && (
                        <div className="pixel-text text-sm mt-1" style={{ color: '#6b5b4f' }}>
                          {entry.journal}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl pixel-icon">{moodData?.emoji}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        * {
          image-rendering: pixelated !important;
          image-rendering: -moz-crisp-edges !important;
          image-rendering: crisp-edges !important;
        }

        .pixel-text {
          font-family: 'Press Start 2P', monospace;
          line-height: 1.6;
        }

        .pixel-icon {
          image-rendering: pixelated;
          display: inline-block;
        }

        .pixel-border {
          border: 4px solid #3e3228;
          border-radius: 0;
          box-sizing: border-box;
        }

        .pixel-shadow {
          box-shadow: 6px 6px 0 #3e3228;
        }

        .pixel-shadow-sm {
          box-shadow: 3px 3px 0 #3e3228;
        }

        .pixel-shadow-selected {
          box-shadow: 0 0 0 4px #ffd700, 6px 6px 0 #3e3228;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0); 
          }
          50% { 
            transform: translateY(-4px); 
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .float {
          animation: float 2.5s ease-in-out infinite;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        button:active {
          transform: translateY(2px);
          box-shadow: 3px 3px 0 #3e3228;
        }

        textarea::placeholder {
          color: #8b7355;
          opacity: 0.7;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #d4c4b0;
          border: 2px solid #3e3228;
        }

        ::-webkit-scrollbar-thumb {
          background: #6b5b4f;
          border: 2px solid #3e3228;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4a3f35;
        }
      `}</style>
    </div>
  );
};

export default MoodGarden;