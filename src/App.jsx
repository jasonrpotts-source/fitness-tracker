import React, { useState, useEffect } from 'react';
import { db, initializeDatabase } from './db';
import ExerciseBrowser from './components/ExerciseBrowser';
import WorkoutManager from './components/WorkoutManager';
import SessionLogger from './components/SessionLogger';
import RecoveryDashboard from './components/RecoveryDashboard';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('recovery');
  const [dbReady, setDbReady] = useState(false);
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    initializeDatabase().then(async () => {
      const exercises = await db.exercises.toArray();
      const customExercises = await db.customExercises.toArray();
      setAllExercises([...exercises, ...customExercises]);
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Initializing Fitness Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="main-nav">
        <button 
          className={`nav-btn ${currentView === 'recovery' ? 'active' : ''}`}
          onClick={() => setCurrentView('recovery')}
        >
          <span className="nav-icon">📊</span>
          Recovery
        </button>
        <button 
          className={`nav-btn ${currentView === 'session' ? 'active' : ''}`}
          onClick={() => setCurrentView('session')}
        >
          <span className="nav-icon">💪</span>
          Workout
        </button>
        <button 
          className={`nav-btn ${currentView === 'workouts' ? 'active' : ''}`}
          onClick={() => setCurrentView('workouts')}
        >
          <span className="nav-icon">📋</span>
          Plans
        </button>
        <button 
          className={`nav-btn ${currentView === 'exercises' ? 'active' : ''}`}
          onClick={() => setCurrentView('exercises')}
        >
          <span className="nav-icon">📖</span>
          Exercises
        </button>
      </nav>

      <main className="main-content">
        {currentView === 'recovery' && <RecoveryDashboard db={db} exercises={allExercises} />}
        {currentView === 'session' && <SessionLogger db={db} exercises={allExercises} setExercises={setAllExercises} />}
        {currentView === 'workouts' && <WorkoutManager db={db} exercises={allExercises} />}
        {currentView === 'exercises' && <ExerciseBrowser db={db} exercises={allExercises} setExercises={setAllExercises} />}
      </main>
    </div>
  );
}
