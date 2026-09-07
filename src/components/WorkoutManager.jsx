import React, { useState, useEffect } from 'react';
import './WorkoutManager.css';

export default function WorkoutManager({ db, exercises }) {
  const [view, setView] = useState('list'); // list, create, edit
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    exercises: []
  });
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const allWorkouts = await db.workouts.toArray();
    setWorkouts(allWorkouts);
  };

  const handleCreateNew = () => {
    setFormData({ name: '', exercises: [] });
    setSelectedWorkout(null);
    setExpandedExercise(null);
    setView('create');
  };

  const handleEdit = (workout) => {
    setFormData(JSON.parse(JSON.stringify(workout)));
    setSelectedWorkout(workout);
    setExpandedExercise(null);
    setView('edit');
  };

  const handleAddExercise = () => {
    const newIndex = formData.exercises.length;
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: '',
          sets: [] // New: array of individual sets instead of sets/reps/weight
        }
      ]
    }));
    setExpandedExercise(newIndex);
  };

  const handleUpdateExercise = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) =>
        idx === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleAddSet = (exerciseIndex) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => {
        if (idx === exerciseIndex) {
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                setId: `set-${Date.now()}`,
                isWarmup: false,
                reps: 10,
                weight: 0,
                rest: 90
              }
            ]
          };
        }
        return ex;
      })
    }));
  };

  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIdx) => {
        if (exIdx === exerciseIndex) {
          return {
            ...ex,
            sets: ex.sets.map((s, sIdx) =>
              sIdx === setIndex ? { ...s, [field]: value } : s
            )
          };
        }
        return ex;
      })
    }));
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, exIdx) => {
        if (exIdx === exerciseIndex) {
          return {
            ...ex,
            sets: ex.sets.filter((_, sIdx) => sIdx !== setIndex)
          };
        }
        return ex;
      })
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index)
    }));
    if (expandedExercise === index) {
      setExpandedExercise(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Workout name is required');
      return;
    }

    if (formData.exercises.length === 0) {
      alert('Add at least one exercise');
      return;
    }

    // Validate each exercise has at least one set
    for (const exercise of formData.exercises) {
      if (!exercise.exerciseId) {
        alert('All exercises must be selected');
        return;
      }
      if (exercise.sets.length === 0) {
        alert('Each exercise must have at least one set');
        return;
      }
    }

    const workout = {
      ...formData,
      name: formData.name.trim(),
      createdAt: selectedWorkout?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (selectedWorkout) {
      // Update existing
      workout.id = selectedWorkout.id;
      await db.workouts.put(workout);
    } else {
      // Create new
      workout.id = `workout-${Date.now()}`;
      await db.workouts.add(workout);
    }

    loadWorkouts();
    setView('list');
    setFormData({ name: '', exercises: [] });
  };

  const handleDelete = async (workoutId) => {
    if (confirm('Delete this workout?')) {
      await db.workouts.delete(workoutId);
      loadWorkouts();
    }
  };

  const handleDuplicate = (workout) => {
    const newWorkout = {
      ...JSON.parse(JSON.stringify(workout)),
      name: `${workout.name} (Copy)`,
      id: `workout-${Date.now()}`
    };
    setFormData(newWorkout);
    setSelectedWorkout(null);
    setExpandedExercise(null);
    setView('create');
  };

  const getExerciseName = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Select exercise...';
  };

  const getWorkingSetCount = (sets) => {
    return sets.filter(s => !s.isWarmup).length;
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // List view
  if (view === 'list') {
    return (
      <div className="workout-manager">
        <div className="section">
          <div className="list-header">
            <div>
              <h2 className="section-header">Workout Plans</h2>
              <p className="section-subheader">Create and manage your workout templates</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateNew}>
              + New Plan
            </button>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="section">
            <p className="empty-state">No workout plans yet. Create your first one!</p>
          </div>
        ) : (
          <div className="workouts-grid">
            {workouts.map(workout => (
              <div key={workout.id} className="workout-card">
                <div className="workout-title">{workout.name}</div>
                
                <div className="workout-exercises">
                  <div className="exercise-count">
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </div>
                  <ul className="exercise-list">
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <li key={idx}>
                        {getExerciseName(ex.exerciseId)}
                      </li>
                    ))}
                    {workout.exercises.length > 3 && (
                      <li className="more">+{workout.exercises.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="workout-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => handleEdit(workout)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={() => handleDuplicate(workout)}
                  >
                    Copy
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(workout.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Create/Edit view
  return (
    <div className="workout-manager">
      <div className="section">
        <div className="form-header">
          <button className="btn" onClick={() => setView('list')}>
            ← Back
          </button>
          <h2 className="section-header">
            {selectedWorkout ? 'Edit Workout' : 'Create Workout'}
          </h2>
        </div>
      </div>

      <div className="section">
        <div className="form-group">
          <label className="form-label">Workout Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))}
            placeholder="e.g., Upper Body Push"
          />
        </div>
      </div>

      <div className="section">
        <div className="exercises-header">
          <h3 className="section-header">Exercises</h3>
          <button className="btn btn-primary" onClick={handleAddExercise}>
            + Add Exercise
          </button>
        </div>

        {formData.exercises.length === 0 ? (
          <p className="empty-state">No exercises added yet</p>
        ) : (
          <div className="exercises-list">
            {formData.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="exercise-card">
                <div className="exercise-header">
                  <div className="exercise-select-group">
                    <select
                      className="form-select"
                      value={ex.exerciseId}
                      onChange={(e) => handleUpdateExercise(exIdx, 'exerciseId', e.target.value)}
                    >
                      <option value="">Select exercise...</option>
                      {filteredExercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="set-count">{ex.sets.length} sets ({getWorkingSetCount(ex.sets)} working)</span>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleRemoveExercise(exIdx)}
                  >
                    Remove
                  </button>
                </div>

                <button
                  className="btn btn-small"
                  onClick={() => setExpandedExercise(expandedExercise === exIdx ? null : exIdx)}
                >
                  {expandedExercise === exIdx ? 'Hide Sets' : 'Edit Sets'}
                </button>

                {expandedExercise === exIdx && (
                  <div className="sets-editor">
                    {ex.sets.map((set, setIdx) => {
                      const workingSetNum = ex.sets.slice(0, setIdx).filter(s => !s.isWarmup).length + 1;
                      
                      return (
                        <div key={setIdx} className="set-editor-row">
                          <div className="set-type">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={set.isWarmup}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'isWarmup', e.target.checked)}
                              />
                              Warmup
                            </label>
                          </div>

                          {!set.isWarmup && (
                            <span className="set-label">Set {workingSetNum}</span>
                          )}

                          <div className="set-inputs">
                            <div className="param-group">
                              <label className="form-label">Weight</label>
                              <input
                                type="number"
                                className="form-input small"
                                min="0"
                                step="5"
                                value={set.weight}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                                placeholder="lbs"
                              />
                            </div>

                            <div className="param-group">
                              <label className="form-label">Reps</label>
                              <input
                                type="number"
                                className="form-input small"
                                min="1"
                                value={set.reps}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                                placeholder="reps"
                              />
                            </div>

                            <div className="param-group">
                              <label className="form-label">Rest</label>
                              <input
                                type="number"
                                className="form-input small"
                                min="0"
                                step="15"
                                value={set.rest}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'rest', Number(e.target.value))}
                                placeholder="sec"
                              />
                            </div>
                          </div>

                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    <button
                      className="btn btn-small"
                      onClick={() => handleAddSet(exIdx)}
                    >
                      + Add Set
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section form-actions">
        <button
          className="btn"
          onClick={() => setView('list')}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          {selectedWorkout ? 'Update Workout' : 'Create Workout'}
        </button>
      </div>
    </div>
  );
}
