/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Feather, Sparkles, Edit3, CheckCircle, Compass, ChevronsRight, Home, Calendar, Star, Settings, Globe, Anchor, Zap, Eye, EyeOff, Trash2, Moon, Sun, Send } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, getDocs, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

// --- IMPORTANT: Placeholder for your Lottie animation JSON ---
import appIconAnimation from './app-icon.json';
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


// Rotating subtitle under the app title
const rotatingSubtitles = [
    "Root your emotions",
    "Harvest calm",
    "Plant a thought",
];

function RotatingSubtitle() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % rotatingSubtitles.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-1 h-5 text-left">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                >
                    {rotatingSubtitles[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );

}
// --- MODIFICATION: Add your default Gemini API key here ---
const DEFAULT_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
        <motion.button
            onClick={onSignIn}
            className="bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center text-gray-700 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#34A853" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FBBC05" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.699 8.164 29.621 6 24 6C16.312 6 9.656 9.884 6.306 14.691z"></path><path fill="#EA4335" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Sign in with Google
        </motion.button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
);

const HomeView = ({ user, onFocusSelect, isLoading, recentEntries, onInsightSelect }) => {
    const [mood, setMood] = useState('');
    const [placeholder, setPlaceholder] = useState("I'm feeling...");

    const placeholders = [
        "I'm feeling anxious...",
        "I'm feeling lost...",
        "I'm feeling overwhelmed...",
        "I'm feeling hopeful...",
        "I'm feeling stuck...",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
        }, 3000);
        return () => clearInterval(interval);
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const handleMoodSubmit = (e) => {
        e.preventDefault();
        if (mood.trim()) {
            onFocusSelect(mood);
            setMood('');
        }
    };

    const emotionChips = [
        { emoji: '😔', text: 'Anxious' },
        { emoji: '😵‍💫', text: 'Overwhelmed' },
        { emoji: '💔', text: 'Lonely' },
        { emoji: '🧘', text: 'Calm' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <motion.div
            className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. Greeting Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {getGreeting()}, {user?.displayName?.split(' ')[0] || 'friend'}{' '}
                    <motion.span
                        animate={{ rotate: [0, 20, 0] }}
                        transition={{
                            duration: 0.8,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'mirror',
                        }}
                        className="inline-block"
                    >
                        👋
                    </motion.span>
                </h1>
                <motion.p
                    className="text-gray-500 dark:text-gray-400 mt-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    What’s weighing on your heart today?
                </motion.p>
            </motion.div>

            {/* 2. Mood Input Section */}
            <motion.div
                variants={itemVariants}
                className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg transition-all duration-300"
            >
                <form onSubmit={handleMoodSubmit}>
                    <div className="relative">
                        <textarea
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            className="w-full p-4 pr-12 bg-gray-100/50 dark:bg-gray-700/50 rounded-xl border-2 border-transparent focus:border-emerald-500 focus:ring-0 transition-all"
                            rows="3"
                            placeholder={placeholder}
                        />
                        <motion.button
                            type="submit"
                            disabled={!mood.trim() || isLoading}
                            className="absolute right-3 top-3 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:bg-emerald-300 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Send size={20} />}
                        </motion.button>
                    </div>
                </form>
                <div className="flex flex-wrap gap-2 mt-4">
                    {emotionChips.map((chip) => (
                        <motion.button
                            key={chip.text}
                            onClick={() => onFocusSelect(`I'm feeling ${chip.text.toLowerCase()}`)}
                            className="px-3 py-1.5 bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200 rounded-full text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all"
                            variants={itemVariants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {chip.emoji} {chip.text}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* 3. Seed of the Day */}
            <motion.div variants={itemVariants} className="glass-card-flat p-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">A thought for your journey…</h3>
                <blockquote className="text-gray-700 dark:text-gray-200 italic">
                    "The quieter you become, the more you are able to hear."
                    <footer className="mt-2 text-xs text-gray-500 not-italic">— Ram Dass</footer>
                </blockquote>
            </motion.div>

            {/* 4. Recent Reflections Carousel */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Reflections</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
                    {recentEntries.length > 0 ? recentEntries.map((entry, i) => (
                        <motion.div
                            key={entry.id}
                            className="flex-shrink-0 w-64 bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                            onClick={() => onInsightSelect(entry)}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.id).toLocaleDateString()}</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-200 mt-1 truncate">"{entry.insight.quote}"</p>
                            <p className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full inline-block mt-3 capitalize">{entry.focus}</p>
                        </motion.div>
                    )) : (
                        <p className="text-gray-500 dark:text-gray-400">Your recent insights will appear here.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};


const RenderWithBold = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*.*?\*)/g);
    return <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{parts.map((part, i) => part.startsWith('*') && part.endsWith('*') ? <strong key={i} className="font-semibold text-gray-800 dark:text-gray-100">{part.slice(1, -1)}</strong> : part)}</p>;
};

const Section = ({ title, icon, text, onTranslate, translation, isLoading }) => {
    const IconComponent = icon;
    const isTranslated = !!translation;
    return (
        <div className="mb-6">
            <h3 className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <IconComponent size={16} className="mr-2 text-emerald-600 dark:text-emerald-400" /> {title}
                <button onClick={onTranslate} disabled={isLoading} className={`ml-auto p-1 rounded-full transition-colors ${isTranslated ? 'text-emerald-600 bg-emerald-100' : 'text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
                    <Globe size={14} />
                </button>
            </h3>
            {isLoading ? <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div> : <RenderWithBold text={translation || text} />}
        </div>
    );
};

const InsightCard = ({ insightData, journalText, setJournalText, onSaveJournal, isSavingJournal, onExit, onToggleFavorite, setIsEditingReflection, onTranslate, translations, isLoadingTranslation }) => {
    const { id, insight, reflection, isFavorite } = insightData;
    return (
        <motion.div
            className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="glass-card w-full relative">
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <button onClick={() => onToggleFavorite(id, !isFavorite)} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-yellow-500 bg-yellow-500/20' : 'text-gray-400 hover:bg-gray-500/10'}`} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}> <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} /> </button>
                    <button onClick={onExit} className="p-2 text-gray-400 hover:bg-gray-500/10 rounded-full" title="New Insight"><Feather name="x" size={18} /></button>
                </div>
                <div className="mb-6 border-b pb-6 border-gray-200 dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{insight.source}</p><blockquote className="text-xl text-gray-800 dark:text-white font-serif mt-2">"{insight.quote}"</blockquote></div>
                <Section title="Modern Analogy" icon={Sparkles} text={insight.analogy} onTranslate={() => onTranslate('analogy', insight.analogy)} translation={translations.analogy} isLoading={isLoadingTranslation.analogy} />
                <Section title="Timeless Root" icon={Anchor} text={insight.root} onTranslate={() => onTranslate('root', insight.root)} translation={translations.root} isLoading={isLoadingTranslation.root} />
                <Section title="Daily Practice" icon={Zap} text={insight.practice} onTranslate={() => onTranslate('practice', insight.practice)} translation={translations.practice} isLoading={isLoadingTranslation.practice} />
                <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700"><h3 className="flex items-center text-lg font-bold text-gray-700 dark:text-gray-200 mb-4"><Edit3 size={20} className="mr-3 text-gray-400" /> My Reflection</h3>{reflection ? (<div className="flex justify-between items-start"><p className="p-4 bg-gray-500/10 rounded-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap flex-1">{reflection}</p><button onClick={() => setIsEditingReflection(true)} className="p-2 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"><Feather size={16} name="edit-2" /></button></div>) : (<><textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} className="w-full p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 dark:text-white" placeholder="One thought on this..." rows={3} /><button onClick={onSaveJournal} disabled={isSavingJournal || !journalText} className="mt-3 w-full md:w-auto px-5 py-2 bg-emerald-600 text-white rounded-md flex items-center justify-center font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300">{isSavingJournal ? (<div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>) : (<CheckCircle size={16} className="mr-2" />)}Save Reflection</button></>)}</div>
            </div>
        </motion.div>
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
                            <div className={`h-1.5 rounded-full ${hasReflected ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: hasReflected ? '100%' : '50%', transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                    </div>
                </div>
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} className="text-gray-400 ml-4" />
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="p-4 border-t border-black/10 dark:border-white/10 space-y-4 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const DailyLogView = ({ entries, onToggleFavorite }) => { // Added onToggleFavorite prop
    const [weekStartDate, setWeekStartDate] = useState(() => { const today = new Date(); const dayOfWeek = today.getDay(); const startDate = new Date(today); startDate.setDate(today.getDate() - dayOfWeek); startDate.setHours(0, 0, 0, 0); return startDate; });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedId, setExpandedId] = useState(null);
    const weekDates = Array.from({ length: 7 }).map((_, i) => { const date = new Date(weekStartDate); date.setDate(weekStartDate.getDate() + i); return date; });
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
                        return (<button key={date.toISOString()} onClick={() => setSelectedDate(date)} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isSelected ? 'bg-emerald-500/20' : 'hover:bg-gray-500/10'}`}><span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isSelected ? 'font-bold' : ''} ${isToday ? 'bg-emerald-500 text-white' : ''}`}>{date.getDate()}</span></button>)
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
                        {/* Added onToggleFavorite button here for each entry */}
                        <button onClick={() => onToggleFavorite(entry.id, !entry.isFavorite)} className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center mt-2">
                            <Star size={14} className="mr-1" fill={entry.isFavorite ? 'currentColor' : 'none'} /> {entry.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </ExpandableEntry>
                )) : <p className="text-gray-500 dark:text-gray-400 text-center pt-8">No seeds planted this day.</p>}
            </div>
        </div>
    );
};

const FavoritesView = ({ entries, onToggleFavorite }) => {
    const [expandedId, setExpandedId] = useState(null);
    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Favorite Seeds</h2>
            <div className="space-y-6">
                {entries.filter(e => e.isFavorite).length > 0 ? entries.filter(e => e.isFavorite).map(entry => (
                    <div key={entry.id}> {/* Wrapper div to place button outside ExpandableEntry's children */}
                        <ExpandableEntry entry={entry} isExpanded={expandedId === entry.id} onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">Focus: {entry.focus}</p>
                            <div><h4 className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider"><Sparkles size={12} className="mr-2" /> Modern Analogy</h4><RenderWithBold text={entry.insight.analogy} /></div>
                            <div><h4 className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider"><Anchor size={12} className="mr-2" /> Timeless Root</h4><RenderWithBold text={entry.insight.root} /></div>
                            <div><h4 className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider"><Zap size={12} className="mr-2" /> Daily Practice</h4><RenderWithBold text={entry.insight.practice} /></div>
                            {entry.reflection && <div><h4 className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wider"><Edit3 size={12} className="mr-2" /> Your Reflection</h4><p className="p-3 bg-gray-500/10 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">{entry.reflection}</p></div>}
                        </ExpandableEntry>
                        {/* Moved the button here to be directly in FavoritesView's scope */}
                        <button onClick={() => onToggleFavorite(entry.id, false)} className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center mt-2 ml-4">
                            <Star size={14} className="mr-1" /> Remove from Favorites
                        </button>
                    </div>
                )) : <p className="text-gray-500 dark:text-gray-400 text-center">Your favorite insights will appear here.</p>}
            </div>
        </div>
    );
};

// --- MODIFICATION: Simplified SettingsView component ---
const SettingsView = ({ settings, onSettingsChange, onSignOut, user, onDeleteAccount }) => {
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
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Translation Language</label>
                        <select
                            id="language-select"
                            value={settings.targetLanguage}
                            onChange={(e) => onSettingsChange({ targetLanguage: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/50 dark:bg-gray-800/50"
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Odia">Odia</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Mandarin Chinese">Mandarin Chinese</option>
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
    const navItems = [{ id: 'home', icon: Home, label: 'Home' }, { id: 'log', icon: Calendar, label: 'Daily Log' }, { id: 'favorites', icon: Star, label: 'Favorites' }, { id: 'settings', icon: Settings, label: 'Settings' }];
    return (
        <nav className="sticky bottom-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-t w-full border-t border-black/10 dark:border-white/10">
            <div className="flex justify-around max-w-2xl mx-auto">
                {navItems.map(item => (<motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-1 flex flex-col items-center p-3 text-sm transition-colors ${activeTab === item.id ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <item.icon size={20} />
                    <span className="mt-1">{item.label}</span>
                </motion.button>))}
            </div>
        </nav>
    );
};

// --- MODIFICATION: Updated MessageModal to handle different types ---
const MessageModal = ({ isOpen, title, message, type, onConfirm, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
                            <span className="text-4xl mr-3">🪷</span>
                            {title}
                        </h3>
                        <div className="my-6 text-gray-600 dark:text-gray-300 space-y-3 text-left">
                            {message}
                        </div>
                        <div className="flex justify-center mt-8 space-x-4">
                            {type === 'clarification' ? (
                                <>
                                    <motion.button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        No, I’ll rephrase
                                    </motion.button>
                                    <motion.button
                                        onClick={onConfirm}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Yes, show me a reflection
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    onClick={onClose}
                                    className="px-10 py-3 bg-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Try again 💚
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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

    const [userSettings, setUserSettings] = useState({ targetLanguage: 'English', theme: 'light' });
    const [translations, setTranslations] = useState({});
    const [isLoadingTranslation, setIsLoadingTranslation] = useState({});
    const [authError, setAuthError] = useState(null);

    // --- MODIFICATION: State for the modal ---
    const [modalContent, setModalContent] = useState({ isOpen: false, title: '', message: null, type: 'rejection' });
    const [greyAreaInput, setGreyAreaInput] = useState(null);
    const [setShowCustomInput] = useState(false);


    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthReady(true);
            setIsLoading(false);
        });
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    // Set theme based on user settings
    useEffect(() => {
        if (userSettings.theme) {
            document.documentElement.className = userSettings.theme;
        }
    }, [userSettings.theme]);

    // Populate journal text when editing reflection
    useEffect(() => {
        if (isEditingReflection && currentInsightData) { setJournalText(currentInsightData.reflection); }
    }, [isEditingReflection, currentInsightData]);

    const callGeminiAPI = useCallback(async (payload) => {
        const apiKey = DEFAULT_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error.message || "Unknown API error");
            }
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }, []);

    // --- MODIFICATION: Updated prompt function for more nuanced validation ---
   const getValidationPrompt = (userInput) => {
      const prompt = `You are a sophisticated AI gatekeeper for a mindfulness app. Your purpose is to analyze the user's input and determine its core intent based on a set of principles.

**Principles:**
1.  **Identify the Core Subject:** Is the user talking about an *internal state* (a feeling, a mood, a doubt) or an *external object/task* (a resume, a person, a technical problem)?
2.  **Determine the Goal:** Is the user's goal *self-reflection* (understanding a feeling) or *problem-solving* (getting information or a result)?
3.  **Handle Ambiguity:** If an emotional word is used for an external problem (e.g., "I'm frustrated with my code"), the intent is likely practical problem-solving, not deep emotional exploration. This is a grey area.
4.  **Reject Inappropriate Content:** Profanity, insults, gibberish, and nonsensical phrases are not aligned with the app's reflective purpose and must be rejected.

**Classification Categories:**
-   **EMOTIONAL_REFLECTION:** The input's primary intent is to explore a personal feeling, mood, or internal struggle.
-   **GREY_AREA:** The input uses emotional words but the context is a practical, external task or problem.
-   **FACTUAL_QUERY:** The input is a request for information, a nonsensical phrase, an insult, or profanity.

**Your Task:**
1.  Analyze the user's input based on the principles above.
2.  If you classify it as **GREY_AREA**, you MUST generate a personalized, reflective message. This message should gently reframe their practical concern into an emotional one, using their original context. For example, if they mention a "resume," your message should guide them to think about the *feeling* behind the resume issue.
3.  Return your response as a single, valid JSON object with the structure: \`{ "classification": "YOUR_CLASSIFICATION", "greyAreaMessage": "YOUR_REFRAMING_MESSAGE_OR_NULL" }\`

**Analysis and Response Generation:**
Now, analyze the following input and generate the JSON response.

Input: "${userInput}"`;

      return {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "classification": { "type": "STRING", "enum": ["EMOTIONAL_REFLECTION", "GREY_AREA", "FACTUAL_QUERY"] },
                      "greyAreaMessage": { "type": "STRING" }
                  },
                  required: ["classification"]
              }
          }
      };
  };

  // Prompt generation for Gemini API
  const getInsightPrompt = (currentFocus, summary, repetitionContext, recentSources) => {
      let context = summary ? `To personalize this, draw from the user's learning journey summary: "${summary}". Weave in their specific actions or metaphors to make the insight deeply resonant.` : '';
      if (repetitionContext) { context += `\n${repetitionContext}`; }

      const shuffledSources = [...wisdomSources].sort(() => 0.5 - Math.random());
      const availableSources = shuffledSources.filter(source => !recentSources.includes(source)).slice(0, 5);

      let sourceConstraint = availableSources.length > 0 ? `Draw inspiration from any profound wisdom tradition or literary work, explicitly favoring but not limited to these sources for variety: ${availableSources.join(', ')}.` : 'Draw inspiration from any profound wisdom tradition or literary work.';

      const prompt = `Act as a wise, modern 'wisdom translator' for someone whose mind is on: '${currentFocus}'. ${context} CRITICAL INSTRUCTION: Your task is to generate a *unique* short phrase, paragraph, essay excerpt, shloka (with its source), or quote. Ensure the entire insight, especially the content and source, is distinct from any previous insights. ${sourceConstraint} Build a resonant daily message around it. Structure your response in a JSON format with five keys: "quote" (which will contain the phrase, paragraph, shloka, or quote), "source", "analogy", "root", and "practice".`;
      return { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { "quote": { "type": "STRING" }, "source": { "type": "STRING" }, "analogy": { "type": "STRING" }, "root": { "type": "STRING" }, "practice": { "type": "STRING" }, }, required: ["quote", "source", "analogy", "root", "practice"] } } };
  };

    // --- MODIFICATION: Added generateAndSaveSummary back ---
    const generateAndSaveSummary = useCallback(async (entries, userDocRef) => {
        const recentReflections = entries.slice(0, 5).filter(e => e.reflection).map(e => `- ${e.reflection}`).join("\n");
        if (!recentReflections) return null;
        const prompt = `You are a compassionate analyst. Based on the following recent reflections from the user, generate a concise summary of their current learning journey and recurring themes. This summary will be used to personalize future insights. Here are the reflections:\n${recentReflections}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        try {
            const summaryText = await callGeminiAPI(payload);
            if (summaryText) {
                await updateDoc(userDocRef, { learningSummary: summaryText });
            }
            return summaryText;
        } catch (e) {
            console.error("Summary generation failed", e);
            return null;
        }
    }, [callGeminiAPI]);

    const generateInsight = useCallback(async (focus) => {
        const appId = 'mindful-seed-app';
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
        let repetitionContext = '';

        const pastEntries = archiveEntries.filter(e => e.focus === focus);
        if (pastEntries.length > 0) {
            const lastDate = new Date(pastEntries[0].id).toLocaleDateString();
            repetitionContext = `The user has explored this exact feeling of '${focus}' before, most recently on ${lastDate}. Acknowledge this continuity in your response.`;
        }
        const recentSources = archiveEntries.slice(0, 10).map(e => e.insight.source);

        const payload = getInsightPrompt(focus, learningSummary, repetitionContext, recentSources);
        const resultText = await callGeminiAPI(payload);
        if (!resultText) throw new Error("API returned no content.");
        const newInsight = JSON.parse(resultText);
        const iconList = ['🌱', '�', '🌸', '💧', '☀️', '⛰️', '⭐', '💎', '🧭', '🕊️'];
        newInsight.icon = iconList[Math.floor(Math.random() * iconList.length)];
        const insightId = new Date().toISOString();
        const insightData = { id: insightId, insight: newInsight, focus: focus, reflection: '', isFavorite: false };
        await setDoc(doc(userDocRef, 'insightsArchive', insightId), insightData);
        setCurrentInsightData(insightData);
        setArchiveEntries(prev => [insightData, ...prev].sort((a, b) => new Date(b.id) - new Date(a.id)));
        setCurrentView('insight');
    }, [user, archiveEntries, learningSummary, callGeminiAPI]);

    // --- MODIFICATION: Updated fetchNewInsight with smarter validation ---
    const fetchNewInsight = useCallback(async (currentFocus) => {
        if (!db || !user) return;
        setIsLoading(true);
        setTranslations({});
        setModalContent({ isOpen: false, title: '', message: null, type: 'rejection' });

        const trimmedFocus = currentFocus.trim();

        if (trimmedFocus.length < 3) {
            setModalContent({
                isOpen: true,
                title: "Let’s try tuning into your inner world...",
                message: <>
                    <p>Your input is a bit too short. Could you tell me a little more about what's on your mind?</p>
                    <p className="mt-4">Try starting with something like: “I’m feeling anxious”, “I don’t know what to do”, or even “I’m lost”.</p>
                </>,
                type: 'rejection'
            });
            setIsLoading(false);
            return;
        }

        try {
            // Step 1: Validate input using Gemini
            const validationPayload = getValidationPrompt(trimmedFocus);
            const validationJson = await callGeminiAPI(validationPayload);
            const validationResponse = JSON.parse(validationJson);
            const { classification, greyAreaMessage } = validationResponse;

            if (classification === 'EMOTIONAL_REFLECTION') {
                await generateInsight(trimmedFocus);
            } else if (classification === 'GREY_AREA') {
                setGreyAreaInput(trimmedFocus);
                setModalContent({
                    isOpen: true,
                    title: "A thought to consider...",
                    message: greyAreaMessage || "It sounds like something’s not sitting right — perhaps it’s not just the task, but how it's making you feel? Want to talk more about that?",
                    type: 'clarification'
                });
            } else { // FACTUAL_QUERY or NONSENSE
                setModalContent({
                    isOpen: true,
                    title: "Let’s try tuning into your inner world...",
                    message: <>
                        <p>That seems more like a question or random thought.</p>
                        <p className="mt-4">Mindful Seed is here to support what your heart feels. Try starting with something like:</p>
                        <ul className="list-disc list-inside mt-2 text-gray-500 dark:text-gray-400">
                            <li>“I’m feeling anxious”</li>
                            <li>“I don’t know what to do”</li>
                            <li>...or even “I’m lost”.</li>
                        </ul>
                        <p className="mt-4">Let’s slow down and try again.</p>
                    </>,
                    type: 'rejection'
                });
            }
        } catch (e) {
            console.error("Error fetching new insight:", e);
            setModalContent({
                isOpen: true,
                title: "An Error Occurred",
                message: <p>{e.message || "Could not generate insight. Please try again."}</p>,
                type: 'rejection'
            });
            setCurrentView('onboarding');
        } finally {
            setIsLoading(false);
        }
    }, [user, callGeminiAPI, generateInsight]);

    const handleProceedWithGreyArea = () => {
        setModalContent({ isOpen: false });
        if (greyAreaInput) {
            setIsLoading(true);
            generateInsight(greyAreaInput).finally(() => {
                setIsLoading(false);
                setGreyAreaInput(null);
            });
        }
    };

    // Load user data and archive entries on auth ready
    useEffect(() => {
        if (isAuthReady && db && user) {
            const appId = 'mindful-seed-app';
            const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
            const archiveColRef = collection(userDocRef, 'insightsArchive');
            const archiveQuery = query(archiveColRef);
            const loadData = async () => {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserSettings(s => ({ ...s, ...data }));
                    setLearningSummary(data.learningSummary || null);
                }
                const archiveSnapshot = await getDocs(archiveQuery);
                const allEntries = archiveSnapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.id) - new Date(a.id));
                setArchiveEntries(allEntries);
            }
            loadData();
        }
    }, [isAuthReady, user]);

    // Handle saving journal reflection
    const handleSaveJournal = async () => {
        if (!journalText || !db || !user || !currentInsightData) return;
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
        } catch (e) { console.error("Error saving journal:", e); }
        finally { setIsSaving(false); }
    };

    // Handle toggling favorite status
    const handleToggleFavorite = async (insightId, isFavorite) => {
        if (!db || !user) return;
        const appId = 'mindful-seed-app';
        const insightDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'insightsArchive', insightId);
        await updateDoc(insightDocRef, { isFavorite });
        const updatedEntries = archiveEntries.map(e => e.id === insightId ? { ...e, isFavorite } : e);
        setArchiveEntries(updatedEntries);
        if (currentInsightData && currentInsightData.id === insightId) { setCurrentInsightData(prev => ({ ...prev, isFavorite })); }
    };

    const handleSettingsChange = async (settingsToSave) => {
        if (!db || !user) return;
        setIsSaving(true);
        const appId = 'mindful-seed-app';
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
        try {
            await setDoc(userDocRef, settingsToSave, { merge: true });
            setUserSettings(s => ({ ...s, ...settingsToSave }));
        } catch (e) {
            console.error("Error saving settings:", e);
        } finally {
            setIsSaving(false);
        }
    }

    // Handle translation of insight sections
    const handleTranslate = async (section, text) => {
        if (translations[section]) {
            setTranslations(prev => {
                const newT = { ...prev };
                delete newT[section];
                return newT;
            });
            return;
        }
        if (userSettings.targetLanguage === 'English') return;

        setIsLoadingTranslation(prev => ({ ...prev, [section]: true }));
        const prompt = `Translate the following text into ${userSettings.targetLanguage}. Keep the tone and meaning intact. Text: "${text}"`;
        try {
            const result = await callGeminiAPI({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            if (result) {
                setTranslations(prev => ({ ...prev, [section]: result }));
            }
        } catch (e) {
            console.error("Translation failed", e);
        }
        finally {
            setIsLoadingTranslation(prev => ({ ...prev, [section]: false }));
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (!user) return;
        const appId = 'mindful-seed-app';
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const archiveColRef = collection(userDocRef, 'insightsArchive');
        try {
            const querySnapshot = await getDocs(archiveColRef);
            for (const docSnap of querySnapshot.docs) {
                await firestoreDeleteDoc(docSnap.ref);
            }
            await firestoreDeleteDoc(userDocRef);
            await deleteUser(user);
        } catch (error) {
            console.error("Error deleting account:", error);
            setAuthError("Account deletion failed. Please sign in again recently to delete your account.");
        }
    }

    // Navigation handlers
    const handleExitInsight = () => { setCurrentInsightData(null); setCurrentView('onboarding'); setShowCustomInput(false); };
    const handleSignIn = () => { if (!auth) return; const provider = new GoogleAuthProvider(); signInWithPopup(auth, provider).catch(error => { console.error("Sign-in error", error); setAuthError(`Could not sign in. Ensure your domain is authorized in Firebase settings. (${error.code})`); }); };
    const handleSignOut = () => { if (auth) signOut(auth); };

    // Show loading spinner while authentication is being checked
    if (!isAuthReady) {
        return <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div></div>
    }

    // Show login screen if no user is authenticated
    if (!user) {
        return <div className="bg-gray-50 min-h-screen flex flex-col"><LoginScreen onSignIn={handleSignIn} error={authError} /></div>
    }

    // Render content based on active tab and current view
    const renderContent = () => {
        const insightCardToShow = isEditingReflection ? (
            <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex-grow animate-fade-in">
                <div className="glass-card w-full p-6 md:p-8 flex flex-col relative">
                    <h3 className="flex items-center text-lg font-bold text-gray-700 dark:text-gray-200 mb-4"><Edit3 size={20} className="mr-3 text-gray-400" /> Edit Reflection</h3>
                    <textarea
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        className="w-full p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 dark:text-white"
                        placeholder="One thought on this..."
                        rows={5}
                    />
                    <div className="flex items-center mt-3">
                        <button
                            onClick={handleSaveJournal}
                            disabled={isSaving || !journalText}
                            className="w-auto px-5 py-2 bg-emerald-600 text-white rounded-md flex items-center justify-center font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300"
                        >
                            {isSaving ? (<div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>) : (<CheckCircle size={16} className="mr-2" />)}
                            Save Changes
                        </button>
                        <button onClick={() => setIsEditingReflection(false)} className="ml-2 px-5 py-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-500/10">Cancel</button>
                    </div>
                </div>
            </div>
        ) : (
            <InsightCard
                insightData={currentInsightData}
                journalText={journalText}
                setJournalText={setJournalText}
                onSaveJournal={handleSaveJournal}
                isSavingJournal={isSaving}
                onExit={handleExitInsight}
                onToggleFavorite={handleToggleFavorite}
                setIsEditingReflection={setIsEditingReflection}
                onTranslate={handleTranslate}
                translations={translations}
                isLoadingTranslation={isLoadingTranslation}
            />
        );

        switch (activeTab) {
            case 'home':
                if (currentView === 'insight' && currentInsightData) return insightCardToShow;
                return <HomeView
                    user={user}
                    onFocusSelect={fetchNewInsight}
                    isLoading={isLoading}
                    recentEntries={archiveEntries.slice(0, 3)}
                    onInsightSelect={(entry) => {
                        setCurrentInsightData(entry);
                        setCurrentView('insight');
                    }}
                />;
            case 'log': return <DailyLogView entries={archiveEntries} onToggleFavorite={handleToggleFavorite} />;
            case 'favorites': return <FavoritesView entries={archiveEntries} onToggleFavorite={handleToggleFavorite} />;
            case 'settings': return <SettingsView settings={userSettings} onSettingsChange={handleSettingsChange} onSignOut={handleSignOut} user={user} onDeleteAccount={handleDeleteAccount} />;
            default: return null;
        }
    };


    return (
        <div className={`min-h-screen flex flex-col font-inter ${userSettings.theme === 'dark' ? 'dark' : ''} bg-gradient-to-br from-emerald-100 via-purple-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200`}>
            <style>{`
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .glass-card { background: rgba(255, 255, 255, 0.5); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border-radius: 1rem; padding: 2rem; border: 1px solid rgba(255, 255, 255, 0.2); }
            .dark .glass-card { background: rgba(26, 32, 44, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); }
            .glass-card-flat { background: rgba(255, 255, 255, 0.4); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); }
            .dark .glass-card-flat { background: rgba(26, 32, 44, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); }
        `}</style>
            <header className="w-full max-w-2xl mx-auto p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {/* App Icon */}
                    <div className="w-8 h-8">
                        <Lottie animationData={appIconAnimation} loop autoplay />
                    </div>
                    {/* Title + Subtitle */}
                    <div className="flex flex-col leading-tight">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            Mindful Seed
                        </h1>
                        <RotatingSubtitle />
                    </div>
                </div>
            </header>
            <div className="flex-grow flex flex-col">{renderContent()}</div>
            <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            <MessageModal
                isOpen={modalContent.isOpen}
                title={modalContent.title}
                message={modalContent.message}
                type={modalContent.type}
                onConfirm={handleProceedWithGreyArea}
                onClose={() => {
                    setModalContent({ isOpen: false });
                    if (modalContent.type === 'rejection' || modalContent.type === 'clarification') {
                        setShowCustomInput(true);
                    }
                }}
            />
        </div>
    );
}
