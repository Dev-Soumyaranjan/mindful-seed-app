import React, { useState, useEffect, useCallback } from 'react';
import { Feather, Sparkles, Edit3, CheckCircle, Compass, ChevronsRight, Home, Calendar, Star, Settings, Globe, Anchor, Zap, Eye, EyeOff, Trash2, Moon, Sun } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, getDocs, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';

// Import the new wisdomSources
import { wisdomSources } from './wisdomSources'; // Assuming src/wisdomSources.js is in the same directory as App.js

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyCELcyY_Ctoz8C7vLXJYPKuB7JHuTj0HCU",
    authDomain: "mindfulseed-8982a.firebaseapp.com",
    projectId: "mindfulseed-8982a",
    storageBucket: "mindfulseed-8982a.firebaseapp.com",
    messagingSenderId: "193897604037",
    appId: "1:193897604037:web:c17fdf0f5a2cd94a9c21ac",
    measurementId: "G-BSPFQPGMW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER & VIEW COMPONENTS ---

const LoginScreen = ({ onSignIn, error }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <span className="text-6xl mb-4">🌱</span>
        <h1 className="text-4xl font-bold text-gray-800 font-serif">Mindful Seed</h1>
        <p className="text-gray-500 mt-2 mb-8 max-w-sm">One timeless thought, whenever you need it. Plant a seed of wisdom for your day.</p>
        <button
            onClick={onSignIn}
            className="bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center text-gray-700 font-semibold"
        >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#34A853" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FBBC05" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C16.312 6 9.656 9.884 6.306 14.691z"></path><path fill="#EA4335" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Sign in with Google
        </button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
);


const OnboardingScreen = ({ onFocusSelect, isLoading, apiError }) => ( <div className="flex-grow flex items-center justify-center animate-fade-in"> <div className="w-full max-w-md p-6 text-center"> {isLoading ? ( <> <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div> <p className="dark:text-gray-300">Preparing your insight...</p> </> ) : ( <OnboardingModal isOpen={true} onFocusSelect={onFocusSelect} /> )} {apiError && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm"> <p className="font-bold">An error occurred:</p> <p>{apiError}</p> </div>} </div> </div> );

const OnboardingModal = ({ isOpen, onFocusSelect }) => {
  const [customFocus, setCustomFocus] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  if (!isOpen) return null;

  const focusOptions = [ { key: 'overwhelmed', label: "I'm feeling overwhelmed.", icon: 'layers' }, { key: 'indecisive', label: "I'm facing a difficult decision.", icon: 'git-branch' }, { key: 'unmotivated', label: "I'm feeling unmotivated.", icon: 'trending-down' }, ];
  const handleCustomSubmit = (e) => { e.preventDefault(); if (customFocus.trim()) { onFocusSelect(customFocus.trim()); } };
  
  return ( <div className="glass-card w-full"> <Compass size={40} className="mx-auto text-emerald-500 mb-4" /> <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">What's on your mind?</h2> <p className="text-gray-500 dark:text-gray-400 mb-8">Choose a theme, or tell us what's happening to get an insight.</p> {!showCustomInput ? ( <div className="space-y-3"> {focusOptions.map(option => ( <button key={option.key} onClick={() => onFocusSelect(option.key)} className="w-full text-left p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center"> <Feather name={option.icon} className="mr-4 text-emerald-600 dark:text-emerald-400" /><span className="font-semibold text-gray-700 dark:text-gray-200">{option.label}</span> </button> ))} <button onClick={() => setShowCustomInput(true)} className="w-full text-left p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center"> <Feather name="edit" className="mr-4 text-emerald-600 dark:text-emerald-400" /><span className="font-semibold text-gray-700 dark:text-gray-200">Something else...</span> </button> </div> ) : ( <form onSubmit={handleCustomSubmit} className="animate-fade-in"> <textarea value={customFocus} onChange={(e) => setCustomFocus(e.target.value)} className="w-full p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 transition-all" placeholder="In a few words, describe what's on your mind..." rows={3} autoFocus /> <button type="submit" disabled={!customFocus.trim()} className="mt-4 w-full p-3 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300"> Continue <ChevronsRight size={20} className="ml-2"/> </button> </form> )} </div> );
};

const RenderWithBold = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*.*?\*)/g);
    return <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{parts.map((part, i) => part.startsWith('*') && part.endsWith('*') ? <strong key={i} className="font-semibold text-gray-800 dark:text-gray-100">{part.slice(1, -1)}</strong> : part )}</p>;
};

const Section = ({ title, icon, text, onTranslate, translation, isLoading }) => {
    const IconComponent = icon;
    const isTranslated = !!translation;
    return (
        <div className="mb-6">
            <h3 className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <IconComponent size={16} className="mr-2 text-emerald-600 dark:text-emerald-400" /> {title}
                <button onClick={onTranslate} disabled={isLoading} className={`ml-auto p-1 rounded-full transition-colors ${isTranslated ? 'text-emerald-600 bg-emerald-100' : 'text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
                    <Globe size={14}/>
                </button>
            </h3>
            {isLoading ? <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div> : <RenderWithBold text={translation || text} />}
        </div>
    );
};

const InsightCard = ({ insightData, journalText, setJournalText, onSaveJournal, isSavingJournal, onExit, onToggleFavorite, setIsEditingReflection, onTranslate, translations, isLoadingTranslation }) => {
  const { id, insight, reflection, isFavorite } = insightData;
  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow animate-fade-in">
      <div className="glass-card w-full relative">
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <button onClick={() => onToggleFavorite(id, !isFavorite)} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-yellow-500 bg-yellow-500/20' : 'text-gray-400 hover:bg-gray-500/10'}`} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}> <Star size={18} fill={isFavorite ? 'currentColor' : 'none'}/> </button>
          <button onClick={onExit} className="p-2 text-gray-400 hover:bg-gray-500/10 rounded-full" title="New Insight"><Feather name="x" size={18}/></button>
        </div>
        <div className="mb-6 border-b pb-6 border-gray-200 dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{insight.source}</p><blockquote className="text-xl text-gray-800 dark:text-white font-serif mt-2">"{insight.quote}"</blockquote></div>
        <Section title="Modern Analogy" icon={Sparkles} text={insight.analogy} onTranslate={() => onTranslate('analogy', insight.analogy)} translation={translations.analogy} isLoading={isLoadingTranslation.analogy} />
        <Section title="Timeless Root" icon={Anchor} text={insight.root} onTranslate={() => onTranslate('root', insight.root)} translation={translations.root} isLoading={isLoadingTranslation.root} />
        <Section title="Daily Practice" icon={Zap} text={insight.practice} onTranslate={() => onTranslate('practice', insight.practice)} translation={translations.practice} isLoading={isLoadingTranslation.practice} />
        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700"><h3 className="flex items-center text-lg font-bold text-gray-700 dark:text-gray-200 mb-4"><Edit3 size={20} className="mr-3 text-gray-400" /> My Reflection</h3>{reflection ? (<div className="flex justify-between items-start"><p className="p-4 bg-gray-500/10 rounded-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap flex-1">{reflection}</p><button onClick={() => setIsEditingReflection(true)} className="p-2 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"><Feather size={16} name="edit-2" /></button></div>) : (<><textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} className="w-full p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 dark:text-white" placeholder="One thought on this..." rows={3}/><button onClick={onSaveJournal} disabled={isSavingJournal || !journalText} className="mt-3 w-full md:w-auto px-5 py-2 bg-emerald-600 text-white rounded-md flex items-center justify-center font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300">{isSavingJournal ? (<div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>) : (<CheckCircle size={16} className="mr-2"/>)}Save Reflection</button></>)}</div>
      </div>
    </div>
  );
};


const ExpandableEntry = ({ entry, children, isExpanded, onToggle }) => {
    const { insight, reflection } = entry;
    const hasReflected = !!reflection;
    return (
        <div className="glass-card-flat w-full">
            <button onClick={onToggle} className="w-full text-left p-4 flex justify-between items-center">
                <div className="flex items-center flex-1 min-w-0">
                   <span className="text-3xl mr-4">{insight.icon || '🌱'}</span>
                   <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 dark:text-gray-200 italic truncate">"{insight.quote}"</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div className={`h-1.5 rounded-full ${hasReflected ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: hasReflected ? '100%' : '50%', transition: 'width 0.5s ease-in-out'}}></div>
                        </div>
                   </div>
                </div>
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} className="text-gray-400 ml-4" />
            </button>
            {isExpanded && ( <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-4 animate-fade-in">{children}</div> )}
        </div>
    );
}

const DailyLogView = ({ entries }) => {
    const [weekStartDate, setWeekStartDate] = useState(() => { const today = new Date(); const dayOfWeek = today.getDay(); const startDate = new Date(today); startDate.setDate(today.getDate() - dayOfWeek); startDate.setHours(0,0,0,0); return startDate; });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedId, setExpandedId] = useState(null);
    const weekDates = Array.from({length: 7}).map((_, i) => { const date = new Date(weekStartDate); date.setDate(weekStartDate.getDate() + i); return date; });
    const changeWeek = (amount) => { setWeekStartDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + (7 * amount)); return d; }); };
    const todaysEntries = entries.filter(entry => new Date(entry.id).toDateString() === selectedDate.toDateString());

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow flex flex-col">
            <div className="glass-card w-full p-4 mb-8">
                   <div className="flex items-center justify-between mb-4"><button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-500/10 text-gray-600 dark:text-gray-300"><Feather name="chevron-left" /></button><h2 className="text-lg font-bold text-gray-800 dark:text-white">{weekStartDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-500/10 text-gray-600 dark:text-gray-300"><Feather name="chevron-right" /></button></div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-xs font-bold text-gray-400">{day}</div>)}
                    {weekDates.map(date => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        return ( <button key={date.toISOString()} onClick={() => setSelectedDate(date)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isSelected ? 'bg-emerald-500/20' : 'hover:bg-gray-500/10'}`}><span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isSelected ? 'font-bold' : ''} ${isToday ? 'bg-emerald-500 text-white' : ''}`}>{date.getDate()}</span></button> )
                    })}
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <div className="space-y-4 flex-grow overflow-y-auto">
                {todaysEntries.length > 0 ? todaysEntries.map(entry => (
                    <ExpandableEntry key={entry.id} entry={entry} isExpanded={expandedId === entry.id} onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">Focus: {entry.focus}</p>
                        <div><h4 className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider"><Sparkles size={12} className="mr-2" /> Modern Analogy</h4><RenderWithBold text={entry.insight.analogy} /></div>
                        <div><h4 className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider"><Anchor size={12} className="mr-2" /> Timeless Root</h4><RenderWithBold text={entry.insight.root} /></div>
                        <div><h4 className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider"><Zap size={12} className="mr-2" /> Daily Practice</h4><RenderWithBold text={entry.insight.practice} /></div>
                        {entry.reflection && <div><h4 className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wider"><Edit3 size={12} className="mr-2" /> Your Reflection</h4><p className="p-3 bg-gray-500/10 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">{entry.reflection}</p></div>}
                    </ExpandableEntry>
                )) : <p className="text-gray-500 dark:text-gray-400 text-center pt-8">No seeds planted this day.</p>}
            </div>
        </div>
    );
};

const FavoritesView = ({ entries, onToggleFavorite }) => {
    const [expandedId, setExpandedId] = useState(null);
    return(
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Favorite Seeds</h2>
            <div className="space-y-6">
                {entries.filter(e => e.isFavorite).length > 0 ? entries.filter(e => e.isFavorite).map(entry => (
                    <ExpandableEntry key={entry.id} entry={entry} isExpanded={expandedId === entry.id} onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">Focus: {entry.focus}</p>
                        <div><h4 className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider"><Sparkles size={12} className="mr-2" /> Modern Analogy</h4><RenderWithBold text={entry.insight.analogy} /></div>
                        <div><h4 className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider"><Anchor size={12} className="mr-2" /> Timeless Root</h4><RenderWithBold text={entry.insight.root} /></div>
                        <div><h4 className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider"><Zap size={12} className="mr-2" /> Daily Practice</h4><RenderWithBold text={entry.insight.practice} /></div>
                        {entry.reflection && <div><h4 className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wider"><Edit3 size={12} className="mr-2" /> Your Reflection</h4><p className="p-3 bg-gray-500/10 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">{entry.reflection}</p></div>}
                        <button onClick={() => onToggleFavorite(entry.id, false)} className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center mt-2"><Star size={14} className="mr-1" /> Remove from Favorites</button>
                    </ExpandableEntry>
                )) : <p className="text-gray-500 dark:text-gray-400 text-center">Your favorite insights will appear here.</p>}
            </div>
        </div>
    );
};

const SettingsView = ({ settings, onSettingsChange, onSave, isSaving, onSignOut, user, onDeleteAccount }) => {
    const [apiKey, setApiKey] = useState(settings.customApiKey || '');
    const [showKey, setShowKey] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
                <div className="text-center mb-8">
                    <img src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt="User" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.displayName || 'Guest User'}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{user.email || 'No email associated'}</p>
                </div>

                <div className="glass-card-flat mb-6 p-6">
                     <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Configuration</h3>
                     <div className="mb-4">
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Your Gemini API Key</label>
                        <div className="relative">
                            <input id="api-key-input" type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white/50 dark:bg-gray-800/50" placeholder="Paste your key to override default..."/>
                            <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                           <button onClick={() => onSave({customApiKey: apiKey})} disabled={isSaving} className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Save Key</button>
                     </div>
                     <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Translation Language</label>
                        <select id="language-select" value={settings.targetLanguage} onChange={(e) => onSettingsChange({targetLanguage: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/50 dark:bg-gray-800/50">
                            <option value="English">English</option> <option value="Spanish">Spanish</option> <option value="French">French</option> <option value="German">German</option> <option value="Hindi">Hindi</option> <option value="Marathi">Marathi</option> <option value="Telugu">Telugu</option> <option value="Tamil">Tamil</option> <option value="Odia">Odia</option> <option value="Japanese">Japanese</option> <option value="Mandarin Chinese">Mandarin Chinese</option>
                        </select>
                     </div>
                </div>

                <div className="glass-card-flat p-6">
                     <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Account</h3>
                     <button onClick={onSignOut} className="w-full text-left p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-500/10 flex items-center font-semibold mb-2">
                         <Feather name="log-out" className="mr-3" /> Sign Out
                     </button>
                     <button onClick={() => setShowDeleteConfirm(true)} className="w-full text-left p-3 rounded-lg text-red-600 hover:bg-red-500/10 flex items-center font-semibold">
                         <Trash2 className="mr-3" /> Delete Account
                     </button>
                </div>
            </div>
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                     <div className="glass-card w-full max-w-sm p-6 text-center">
                         <h3 className="text-lg font-bold text-red-500">Are you sure?</h3>
                         <p className="my-4 text-sm text-gray-600 dark:text-gray-300">This will permanently delete your account and all of your saved insights and reflections. This action cannot be undone.</p>
                         <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-md">Cancel</button>
                             <button onClick={onDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-md">Yes, Delete</button>
                         </div>
                     </div>
                </div>
            )}
        </>
    );
};

const NavBar = ({ activeTab, setActiveTab }) => {
    const navItems = [ { id: 'home', icon: Home, label: 'Home' }, { id: 'log', icon: Calendar, label: 'Daily Log' }, { id: 'favorites', icon: Star, label: 'Favorites' }, { id: 'settings', icon: Settings, label: 'Settings' } ];
    return (
        <nav className="sticky bottom-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-t w-full border-t border-black/10 dark:border-white/10">
            <div className="flex justify-around max-w-2xl mx-auto">
                {navItems.map(item => ( <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center p-3 text-sm transition-colors ${activeTab === item.id ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}> <item.icon size={20} /> <span className="mt-1">{item.label}</span> </button> ))}
            </div>
        </nav>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('onboarding');
  const [currentInsightData, setCurrentInsightData] = useState(null);
  const [archiveEntries, setArchiveEntries] = useState([]);
  const [learningSummary, setLearningSummary] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [userSettings, setUserSettings] = useState({ targetLanguage: 'English', customApiKey: '', theme: 'light' });
  const [translations, setTranslations] = useState({});
  const [isLoadingTranslation, setIsLoadingTranslation] = useState({});
  const [authError, setAuthError] = useState(null);
  const [apiError, setApiError] = useState(null);
  
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsAuthReady(true);
        setIsLoading(false);
    });
  }, []);

  useEffect(() => {
      if(userSettings.theme) {
        document.documentElement.className = userSettings.theme;
      }
  }, [userSettings.theme]);
  
  useEffect(() => {
      if (isEditingReflection && currentInsightData) { setJournalText(currentInsightData.reflection); }
  }, [isEditingReflection, currentInsightData]);

  const callGeminiAPI = useCallback(async (payload) => {
      const apiKey = userSettings.customApiKey || import.meta.env.VITE_GEMINI_API_KEY;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      try { const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { const err = await response.json(); throw new Error(err.error.message); } const result = await response.json(); return result.candidates?.[0]?.content?.parts?.[0]?.text; } catch (error) { console.error("Gemini API Error:", error); throw error; }
  }, [userSettings.customApiKey]);

  const getInsightPrompt = (currentFocus, summary, repetitionContext, recentSources) => {
      let context = summary ? `To personalize this, draw from the user's learning journey summary: "${summary}". Weave in their specific actions or metaphors to make the insight deeply resonant.` : '';
      if (repetitionContext) { context += `\n${repetitionContext}`; }
      
      // Select a random set of sources to guide the model, ensuring diversity
      const shuffledSources = [...wisdomSources].sort(() => 0.5 - Math.random());
      const availableSources = shuffledSources.filter(source => !recentSources.includes(source)).slice(0, 5); // Limit to 5 for prompt brevity
      
      let sourceConstraint = availableSources.length > 0 ? `Draw inspiration from any profound wisdom tradition or literary work, explicitly favoring but not limited to these sources for variety: ${availableSources.join(', ')}.` : 'Draw inspiration from any profound wisdom tradition or literary work.';

      // Emphasize uniqueness and varied formats
      const prompt = `Act as a wise, modern 'wisdom translator' for someone whose mind is on: '${currentFocus}'. ${context} CRITICAL INSTRUCTION: Your task is to generate a *unique* short phrase, paragraph, essay excerpt, shloka (with its source), or quote. Ensure the entire insight, especially the content and source, is distinct from any previous insights. ${sourceConstraint} Build a resonant daily message around it. Structure your response in a JSON format with five keys: "quote" (which will contain the phrase, paragraph, shloka, or quote), "source", "analogy", "root", and "practice".`;
      return { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { "quote": { "type": "STRING" }, "source": { "type": "STRING" }, "analogy": { "type": "STRING" }, "root": { "type": "STRING" }, "practice": { "type": "STRING" }, }, required: ["quote", "source", "analogy", "root", "practice"] } } };
  };
  
  const generateAndSaveSummary = useCallback(async (entries, userDocRef) => {
      const recentReflections = entries.slice(0, 5).filter(e => e.reflection).map(e => `- ${e.reflection}`).join("\n"); if (!recentReflections) return null; const prompt = `You are a compassionate analyst...`; const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] }; try { const summaryText = await callGeminiAPI(payload); if (summaryText) { await updateDoc(userDocRef, { learningSummary: summaryText }); } return summaryText; } catch(e) { console.error("Summary generation failed", e); return null; }
  }, [callGeminiAPI]);

  const fetchNewInsight = useCallback(async (currentFocus) => {
    if (!db || !user) return;
    setIsLoading(true); setTranslations({}); setApiError(null);
    const appId = 'mindful-seed-app';
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
    let repetitionContext = '';
    const predefinedFocusKeys = ['overwhelmed', 'indecisive', 'unmotivated'];
    if (!predefinedFocusKeys.includes(currentFocus)) {
        const pastEntries = archiveEntries.filter(e => e.focus === currentFocus);
        if (pastEntries.length > 0) { const lastDate = new Date(pastEntries[0].id).toLocaleDateString(); repetitionContext = `The user has explored this exact feeling of '${currentFocus}' before, most recently on ${lastDate}. Acknowledge this continuity in your response.`; }
    }
    // Get recent sources from the archive to avoid repetition
    const recentSources = archiveEntries.slice(0, 10).map(e => e.insight.source); // Increased recent sources to check against
    
    try {
        const payload = getInsightPrompt(currentFocus, learningSummary, repetitionContext, recentSources);
        const resultText = await callGeminiAPI(payload);
        if(!resultText) throw new Error("API returned no content.");
        const newInsight = JSON.parse(resultText);
        const iconList = ['🌱', '🌿', '🌸', '💧', '☀️', '⛰️', '⭐', '💎', '🧭', '🕊️'];
        newInsight.icon = iconList[Math.floor(Math.random() * iconList.length)];
        const insightId = new Date().toISOString();
        const insightData = { id: insightId, insight: newInsight, focus: currentFocus, reflection: '', isFavorite: false };
        await setDoc(doc(userDocRef, 'insightsArchive', insightId), insightData);
        setCurrentInsightData(insightData);
        setArchiveEntries(prev => [insightData, ...prev].sort((a,b) => new Date(b.id) - new Date(a.id)));
        setCurrentView('insight');
    } catch(e) { 
        console.error("Error fetching new insight:", e); 
        setApiError(e.message || "Could not generate insight. Please check your API key and try again.");
        setCurrentView('onboarding');
    } finally {
        setIsLoading(false);
    }
  }, [user, callGeminiAPI, learningSummary, archiveEntries]);

  useEffect(() => {
    if (isAuthReady && db && user) {
      const appId = 'mindful-seed-app';
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      const archiveColRef = collection(userDocRef, 'insightsArchive');
      const archiveQuery = query(archiveColRef);
      const loadData = async () => {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) { const data = userDocSnap.data(); setUserSettings(s => ({...s, ...data})); }
        const archiveSnapshot = await getDocs(archiveQuery);
        const allEntries = archiveSnapshot.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.id) - new Date(a.id));
        setArchiveEntries(allEntries);
      }
      loadData();
    }
  }, [isAuthReady, user]);
  
  const handleSaveJournal = async () => {
    if(!journalText || !db || !user || !currentInsightData) return;
    setIsSaving(true);
    const appId = 'mindful-seed-app';
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const insightDocRef = doc(userDocRef, 'insightsArchive', currentInsightData.id);
    try {
        await updateDoc(insightDocRef, { reflection: journalText });
        const updatedInsightData = { ...currentInsightData, reflection: journalText };
        setCurrentInsightData(updatedInsightData);
        const updatedEntries = archiveEntries.map(e => e.id === currentInsightData.id ? updatedInsightData : e);
        setArchiveEntries(updatedEntries);
        const newSummary = await generateAndSaveSummary(updatedEntries, userDocRef);
        setLearningSummary(newSummary);
        setJournalText('');
        setIsEditingReflection(false);
    } catch(e) { console.error("Error saving journal:", e); } 
    finally { setIsSaving(false); }
  };
  
  const handleToggleFavorite = async (insightId, isFavorite) => {
    if(!db || !user) return;
    const appId = 'mindful-seed-app';
    const insightDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'insightsArchive', insightId);
    await updateDoc(insightDocRef, { isFavorite });
    const updatedEntries = archiveEntries.map(e => e.id === insightId ? {...e, isFavorite} : e);
    setArchiveEntries(updatedEntries);
    if(currentInsightData && currentInsightData.id === insightId){ setCurrentInsightData(prev => ({...prev, isFavorite})); }
  };

  const handleSettingsSave = async (settingsToSave) => {
      if (!db || !user) return;
      setIsSaving(true);
      const appId = 'mindful-seed-app';
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await setDoc(userDocRef, settingsToSave, { merge: true });
      setUserSettings(s => ({...s, ...settingsToSave}));
      setIsSaving(false);
  }

  const handleTranslate = async (section, text) => {
      if (translations[section]) { setTranslations(prev => { const newT = {...prev}; delete newT[section]; return newT; }); return; }
      if (userSettings.targetLanguage === 'English') return;
      setIsLoadingTranslation(prev => ({...prev, [section]: true}));
      const prompt = `Translate the following text into ${userSettings.targetLanguage}. Keep the tone and meaning intact. Text: "${text}"`;
      try { const result = await callGeminiAPI({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }); if(result) { setTranslations(prev => ({...prev, [section]: result})); }
      } catch (e) { console.error("Translation failed", e); } 
      finally { setIsLoadingTranslation(prev => ({...prev, [section]: false})); }
  };
    
  const handleDeleteAccount = async () => {
    if(!user) return;
    const appId = 'mindful-seed-app';
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const archiveColRef = collection(userDocRef, 'insightsArchive');
    try {
        const querySnapshot = await getDocs(archiveColRef);
        for(const docSnap of querySnapshot.docs){
            await firestoreDeleteDoc(docSnap.ref);
        }
        await firestoreDeleteDoc(userDocRef);
        await deleteUser(user);
    } catch (error) {
        console.error("Error deleting account:", error);
    }
  }

  const handleExitInsight = () => { setCurrentInsightData(null); setCurrentView('onboarding'); setTranslations({}); };
  const handleSignIn = () => { if (!auth) return; const provider = new GoogleAuthProvider(); signInWithPopup(auth, provider).catch(error => { console.error("Sign-in error", error); setAuthError(`Could not sign in. Ensure your domain is authorized in Firebase settings. (${error.code})`); }); };
  const handleSignOut = () => { if (auth) signOut(auth); };

  if (!isAuthReady) {
      return <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div></div>
  }

  if (!user) {
      return <div className="bg-gray-50 min-h-screen flex flex-col"><LoginScreen onSignIn={handleSignIn} error={authError}/></div>
  }

  const renderContent = () => {
      const insightCardToShow = isEditingReflection ? ( <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow animate-fade-in"> <div className="glass-card w-full p-6 md:p-8 flex flex-col relative"> <h3 className="flex items-center text-lg font-bold text-gray-700 dark:text-gray-200 mb-4"><Edit3 size={20} className="mr-3 text-gray-400" /> Edit Reflection</h3> <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} className="w-full p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 dark:text-white" placeholder="One thought on this..." rows={5}/> <div className="flex items-center mt-3"> <button onClick={handleSaveJournal} disabled={isSaving || !journalText} className="w-auto px-5 py-2 bg-emerald-600 text-white rounded-md flex items-center justify-center font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300">{isSaving ? (<div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>) : (<CheckCircle size={16} className="mr-2"/>)}Save Changes</button> <button onClick={() => setIsEditingReflection(false)} className="ml-2 px-5 py-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-500/10">Cancel</button> </div> </div> </div> ) : ( <InsightCard insightData={currentInsightData} journalText={journalText} setJournalText={setJournalText} onSaveJournal={handleSaveJournal} isSavingJournal={isSaving} onExit={handleExitInsight} onToggleFavorite={handleToggleFavorite} setIsEditingReflection={setIsEditingReflection} onTranslate={handleTranslate} translations={translations} isLoadingTranslation={isLoadingTranslation} /> );
      switch(activeTab) {
          case 'home':
              if (currentView === 'onboarding') return <OnboardingScreen onFocusSelect={fetchNewInsight} isLoading={isLoading} apiError={apiError} />;
              if (currentView === 'insight' && currentInsightData) return insightCardToShow;
              return <OnboardingScreen onFocusSelect={fetchNewInsight} isLoading={isLoading} apiError={apiError} />;
          case 'log': return <DailyLogView entries={archiveEntries} />;
          case 'favorites': return <FavoritesView entries={archiveEntries} onToggleFavorite={handleToggleFavorite} />;
          case 'settings': return <SettingsView settings={userSettings} onSettingsChange={(newSettings) => handleSettingsSave(newSettings)} onSave={() => handleSettingsSave(userSettings)} isSaving={isSaving} onSignOut={handleSignOut} user={user} onDeleteAccount={handleDeleteAccount} />;
          default: return null;
      }
  };

 
  return (
<div className={`min-h-screen flex flex-col font-inter ${userSettings.theme === 'dark' ? 'dark' : ''} bg-gradient-to-br from-emerald-100 via-purple-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200`}>      <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .glass-card { background: rgba(255, 255, 255, 0.5); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border-radius: 1rem; padding: 2rem; border: 1px solid rgba(255, 255, 255, 0.2); } .dark .glass-card { background: rgba(26, 32, 44, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); } .glass-card-flat { background: rgba(255, 255, 255, 0.4); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } .dark .glass-card-flat { background: rgba(26, 32, 44, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); }`}</style>
      <header className="w-full max-w-2xl mx-auto p-6 flex justify-between items-center text-gray-500 dark:text-gray-400">
          <div className="flex items-center"><span className="text-xl font-bold text-gray-700 dark:text-gray-200">🌱</span><h1 className="text-lg font-semibold text-gray-600 dark:text-gray-300 ml-2">Mindful Seed</h1></div>
      </header>
      <div className="flex-grow flex flex-col">{renderContent()}</div>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
