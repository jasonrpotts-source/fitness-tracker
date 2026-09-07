import React, { useState, useEffect } from 'react';
import { calculate1RM } from '../utils';
import './SessionLogger.css';

const PRESET_REST_TIMES = [30, 60, 90, 120, 180];

export default function SessionLogger({ db, exercises, setExercises }) {
  const [view, setView] = useState('select'); // select, session, finish
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionSets, setSessionSets] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Rest timer state
  const [restTimer, setRestTimer] = useState(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (!isRestActive || restRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setRestRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRestActive, restRemaining]);

  const loadWorkouts = async () => {
    const allWorkouts = await db.workouts.toArray();
    setWorkouts(allWorkouts);
  };

  const startSession = async (workout) => {
    setSelectedWorkout(workout);
    setCurrentSession(workout);
    
    // Parse exercises for this workout - now using per-set configuration
    const sets = workout.exercises.flatMap(ex => {
      return ex.sets.map((set, idx) => ({
        id: `${workout.id}-${ex.exerciseId}-${idx}`,
        exerciseId: ex.exerciseId,
        targetReps: set.reps,
        targetWeight: set.weight,
        restTime: set.rest || 90,
        isWarmup: set.isWarmup || false,
        completed: false,
        actualWeight: set.weight,
        actualReps: null,
        createdAt: null
      }));
    });
    
    setSessionSets(sets);
    setView('session');
  };

  const updateSet = (setId, field, value) => {
    setSessionSets(prev => prev.map(set =>
      set.id === setId
        ? { ...set, [field]: value }
        : set
    ));
  };

  const completeSet = async (setIndex) => {
    const set = sessionSets[setIndex];
    
    if (set.actualReps === null || set.actualReps === '') {
      alert('Please enter reps');
      return;
    }

    const updatedSet = {
      ...set,
      completed: true,
      createdAt: new Date()
    };

    // Save to database
    await db.sets.add({
      id: `${set.id}-${Date.now()}`,
      exerciseId: set.exerciseId,
      weight: Number(set.actualWeight),
      reps: Number(set.actualReps),
      workoutId: currentSession.id,
      createdAt: new Date()
    });

    setSessionSets(prev => prev.map((s, idx) =>
      idx === setIndex ? updatedSet : s
    ));

    // Start rest timer
    if (set.restTime > 0) {
      setRestTimer(set.restTime);
      setRestRemaining(set.restTime);
      setIsRestActive(true);
    }

    // Move to next set
    const nextIncompleteIdx = sessionSets.findIndex((s, idx) => idx > setIndex && !s.completed);
    if (nextIncompleteIdx === -1) {
      // All sets completed
      setTimeout(() => {
        setView('finish');
      }, 1500);
    }
  };

  const finishSession = async () => {
    setIsRestActive(false);
    setRestTimer(null);
    setRestRemaining(0);
    alert('Workout completed! 💪');
    setView('select');
    setSessionSets([]);
    setNotes('');
    setSelectedWorkout(null);
  };

  const skipRest = () => {
    setIsRestActive(false);
    setRestTimer(null);
    setRestRemaining(0);
  };

  const formatRestTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseName = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  // Select view
  if (view === 'select') {
    return (
      <div className="session-logger">
        <div className="section">
          <h2 className="section-header">Start a Workout</h2>
          <p className="section-subheader">Select a workout plan to begin logging</p>
        </div>

        {workouts.length === 0 ? (
          <div className="section">
            <p className="empty-state">No workout plans found. Create one in the Plans tab first.</p>
          </div>
        ) : (
          <div className="workouts-list">
            {workouts.map(workout => (
              <div key={workout.id} className="workout-option">
                <div className="workout-info">
                  <h3>{workout.name}</h3>
                  <p>{workout.exercises.length} exercises</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => startSession(workout)}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Finish view
  if (view === 'finish') {
    return (
      <div className="session-logger">
        <div className="section">
          <h3 className="section-header">Workout Complete! 🎉</h3>
          <p className="section-subheader">
            You completed {completedCount} out of {sessionSets.length} sets
          </p>
          
          <div className="form-group">
            <label className="form-label">Workout Notes (Optional)</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did this workout feel? Any observations?"
            />
          </div>

          <div className="button-group">
            <button 
              className="btn"
              onClick={() => setView('select')}
            >
              Continue Later
            </button>
            <button 
              className="btn btn-primary"
              onClick={finishSession}
            >
              Save & Finish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session view
  const currentSetIndex = sessionSets.findIndex(s => !s.completed);
  const completedCount = sessionSets.filter(s => s.completed).length;
  const isSessionComplete = currentSetIndex === -1;

  return (
    <div className="session-logger">
      <div className="session-header">
        <div>
          <h2 className="session-title">{currentSession?.name}</h2>
          <p className="session-progress">
            {completedCount} / {sessionSets.length} sets completed
          </p>
        </div>
        <div className="session-buttons">
          {completedCount > 0 && (
            <button 
              className="btn btn-primary btn-small"
              onClick={() => setView('finish')}
            >
              Finish Workout
            </button>
          )}
          <button 
            className="btn btn-danger btn-small"
            onClick={() => {
              if (confirm('Discard this workout? All logged sets will be lost.')) {
                setView('select');
                setSessionSets([]);
                setNotes('');
              }
            }}
          >
            Discard
          </button>
        </div>
      </div>

      {isRestActive && (
        <div className="rest-timer-overlay">
          <div className="rest-timer">
            <div className="rest-label">Rest Time</div>
            <div className="rest-display">{formatRestTime(restRemaining)}</div>
            <button className="btn btn-small" onClick={skipRest}>
              Skip Rest
            </button>
          </div>
        </div>
      )}

      <div className="sets-container">
        {sessionSets.map((set, idx) => {
          const exercise = exercises.find(ex => ex.id === set.exerciseId);
          const currentOneRM = set.actualReps ? calculate1RM(set.actualWeight, set.actualReps) : null;
          const isCurrentSet = idx === currentSetIndex;

          return (
            <div 
              key={set.id} 
              className={`set-card ${set.completed ? 'completed' : ''} ${isCurrentSet ? 'current' : ''}`}
            >
              <div className="set-header">
                <div className="set-number">
                  Set {set.setNumber}
                  {set.isWarmup && <span className="warmup-badge">W</span>}
                </div>
                <div className="set-exercise">
                  {exercise?.name}
                </div>
              </div>

              <div className="set-target">
                <span className="target-label">Target:</span>
                <span className="target-value">
                  {set.targetWeight} lb × {set.targetReps} reps
                </span>
              </div>

              {set.completed ? (
                <div className="set-result">
                  <div className="result-line">
                    Logged: {set.actualWeight} lb × {set.actualReps} reps
                  </div>
                  {currentOneRM && (
                    <div className="result-line">
                      Est. 1RM: {currentOneRM.toFixed(1)} lb
                    </div>
                  )}
                  <div className="checkmark">✓</div>
                </div>
              ) : isCurrentSet ? (
                <div className="set-input-section">
                  <div className="input-group">
                    <div className="input-field">
                      <label className="form-label">Weight (lbs)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={set.actualWeight}
                        onChange={(e) => updateSet(set.id, 'actualWeight', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="input-field">
                      <label className="form-label">Reps</label>
                      <input
                        type="number"
                        className="form-input"
                        value={set.actualReps || ''}
                        onChange={(e) => updateSet(set.id, 'actualReps', e.target.value)}
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                  </div>

                  {set.actualReps && (
                    <div className="estimated-1rm">
                      <span className="label">Est. 1RM:</span>
                      <span className="value">
                        {calculate1RM(set.actualWeight, set.actualReps).toFixed(1)} lb
                      </span>
                    </div>
                  )}

                  <div className="set-actions">
                    <button
                      className="btn btn-success btn-large"
                      onClick={() => completeSet(idx)}
                    >
                      Log Set
                    </button>
                  </div>

                  {set.restTime > 0 && (
                    <div className="rest-time-info">
                      Rest: {set.restTime}s
                    </div>
                  )}
                </div>
              ) : (
                <div className="set-pending">
                  Pending...
                </div>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
}
