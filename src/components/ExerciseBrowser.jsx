import React, { useState, useEffect } from 'react';
import { getExerciseHistoryWith1RM, getHighest1RM } from '../utils';
import './ExerciseBrowser.css';

export default function ExerciseBrowser({ db, exercises, setExercises }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [highest1RM, setHighest1RM] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customExerciseForm, setCustomExerciseForm] = useState({
    name: '',
    muscleGroups: []
  });

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'forearms', 'abs',
    'calves', 'traps', 'obliques', 'hip-flexors'
  ];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = !selectedMuscle || (ex.muscleGroups?.includes(selectedMuscle));
    return matchesSearch && matchesMuscle;
  });

  const handleSelectExercise = async (exercise) => {
    setSelectedExercise(exercise);
    const history = await getExerciseHistoryWith1RM(exercise.id, db);
    setExerciseHistory(history.reverse());
    const max1RM = await getHighest1RM(exercise.id, db);
    setHighest1RM(max1RM);
  };

  const handleCreateCustomExercise = async () => {
    if (!customExerciseForm.name.trim()) {
      alert('Exercise name is required');
      return;
    }

    if (customExerciseForm.muscleGroups.length === 0) {
      alert('Select at least one muscle group');
      return;
    }

    const newExercise = {
      id: `custom-${Date.now()}`,
      name: customExerciseForm.name.trim(),
      muscleGroups: customExerciseForm.muscleGroups,
      category: 'custom',
      isCustom: true
    };

    await db.customExercises.add(newExercise);
    
    const allExercises = [...exercises, newExercise];
    setExercises(allExercises);
    
    setCustomExerciseForm({ name: '', muscleGroups: [] });
    setShowCreateForm(false);
    alert('Custom exercise created!');
  };

  const handleToggleMuscleGroup = (muscle) => {
    setCustomExerciseForm(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter(m => m !== muscle)
        : [...prev.muscleGroups, muscle]
    }));
  };

  const handleDeleteCustomExercise = async (exerciseId) => {
    if (confirm('Delete this custom exercise?')) {
      await db.customExercises.delete(exerciseId);
      const updated = exercises.filter(ex => ex.id !== exerciseId);
      setExercises(updated);
      setSelectedExercise(null);
      setExerciseHistory([]);
    }
  };

  return (
    <div className="exercise-browser">
      <div className="browser-layout">
        {/* Left Panel - Exercise List */}
        <div className="exercise-list-panel">
          <div className="section">
            <h2 className="section-header">Exercises</h2>
            
            <div className="search-controls">
              <input
                type="text"
                className="form-input"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select
                className="form-select"
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
              >
                <option value="">All Muscles</option>
                {muscleGroups.map(muscle => (
                  <option key={muscle} value={muscle}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>

              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                + Custom
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div className="section create-form">
              <h3 className="section-header">Create Custom Exercise</h3>
              
              <div className="form-group">
                <label className="form-label">Exercise Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={customExerciseForm.name}
                  onChange={(e) => setCustomExerciseForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="e.g., Band Pull Apart"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Muscle Groups</label>
                <div className="muscle-checkboxes">
                  {muscleGroups.map(muscle => (
                    <label key={muscle} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customExerciseForm.muscleGroups.includes(muscle)}
                        onChange={() => handleToggleMuscleGroup(muscle)}
                      />
                      {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('-', ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCustomExerciseForm({ name: '', muscleGroups: [] });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateCustomExercise}
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="exercises-scroll">
            {filteredExercises.length === 0 ? (
              <div className="section">
                <p className="empty-state">No exercises found</p>
              </div>
            ) : (
              <div className="exercises-list">
                {filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className={`exercise-item ${selectedExercise?.id === exercise.id ? 'selected' : ''}`}
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <div className="exercise-item-content">
                      <div className="exercise-item-name">{exercise.name}</div>
                      <div className="exercise-item-meta">
                        {exercise.muscleGroups?.join(', ')}
                      </div>
                      {exercise.isCustom && <span className="custom-badge">Custom</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Exercise Details */}
        <div className="exercise-detail-panel">
          {selectedExercise ? (
            <div>
              <div className="section">
                <div className="detail-header">
                  <div>
                    <h2 className="section-header">{selectedExercise.name}</h2>
                    <div className="detail-meta">
                      {selectedExercise.muscleGroups?.map(m => (
                        <span key={m} className="badge badge-primary">
                          {m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' ')}
                        </span>
                      ))}
                      {selectedExercise.category && (
                        <span className="badge">
                          {selectedExercise.category}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedExercise.isCustom && (
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteCustomExercise(selectedExercise.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {highest1RM > 0 && (
                <div className="section">
                  <div className="stat-display">
                    <div className="stat-label">Estimated 1RM</div>
                    <div className="stat-value-large">{highest1RM.toFixed(1)} lbs</div>
                  </div>
                </div>
              )}

              {exerciseHistory.length > 0 && (
                <div className="section">
                  <h3 className="section-header">History</h3>
                  <p className="section-subheader">Last {exerciseHistory.length} sets logged</p>
                  
                  <div className="history-list">
                    {exerciseHistory.slice(0, 20).map((set, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-date">
                          {new Date(set.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="history-stats">
                          <span className="stat">{set.weight} lbs</span>
                          <span className="stat">×{set.reps}</span>
                          <span className="stat-1rm">1RM: {set.estimatedOneRM.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {exerciseHistory.length > 20 && (
                    <p className="section-subheader">
                      ...and {exerciseHistory.length - 20} more
                    </p>
                  )}
                </div>
              )}

              {exerciseHistory.length === 0 && (
                <div className="section">
                  <p className="empty-state">No history logged yet. Start a workout!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="section">
              <p className="empty-state">Select an exercise to view details and history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
