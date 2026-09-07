import React, { useState, useEffect } from 'react';
import { calculateMuscleFatigue, exportToCSV, exportToJSON, importFromJSON } from '../utils';
import './RecoveryDashboard.css';

export default function RecoveryDashboard({ db, exercises }) {
  const [fatigue, setFatigue] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    loadFatigue();
  }, [period]);

  const loadFatigue = async () => {
    setLoading(true);
    const data = await calculateMuscleFatigue(db, period);
    setFatigue(data);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return '#10b981';
      case 'recovered':
        return '#10b981';
      case 'moderate':
        return '#f59e0b';
      case 'fatigued':
        return '#ef4444';
      case 'overworked':
        return '#b91c1c';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'recovered':
        return 'Recovered';
      case 'moderate':
        return 'Moderate';
      case 'fatigued':
        return 'Fatigued';
      case 'overworked':
        return 'Overworked';
      default:
        return 'Unknown';
    }
  };

  const handleExportCSV = async () => {
    const sets = await db.sets.toArray();
    const allExercises = [...(await db.exercises.toArray()), ...(await db.customExercises.toArray())];
    const csv = exportToCSV(sets, allExercises);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportJSON = async () => {
    const json = await exportToJSON(db);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importFromJSON(db, text);
      
      if (result.success) {
        alert('✅ Data imported successfully! Please refresh the page to see changes.');
        // Optionally reload the page
        // window.location.reload();
      } else {
        alert(`❌ Import failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error reading file: ${error.message}`);
    }

    // Reset input
    event.target.value = '';
  };

  const muscleGroups = Object.keys(fatigue).sort();

  if (loading) {
    return (
      <div className="recovery-dashboard">
        <div className="loading">Loading recovery data...</div>
      </div>
    );
  }

  return (
    <div className="recovery-dashboard">
      <div className="section">
        <div className="dashboard-header">
          <div>
            <h2 className="section-header">Recovery Dashboard</h2>
            <p className="section-subheader">Last {period} days muscle usage and fatigue levels</p>
          </div>
          <div className="header-controls">
            <select 
              className="form-select period-select"
              value={period} 
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={1}>Last 1 day</option>
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <button className="btn btn-primary" onClick={handleExportCSV}>
              📊 CSV
            </button>
            <button className="btn btn-primary" onClick={handleExportJSON}>
              💾 Backup
            </button>
            <label className="btn btn-primary" style={{ cursor: 'pointer', marginBottom: 0 }}>
              📂 Restore
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="muscle-grid">
        {muscleGroups.map(muscle => {
          const data = fatigue[muscle];
          const percentage = Math.min(data.percentage, 200);
          
          return (
            <div key={muscle} className="muscle-card">
              <div className="muscle-name">
                {muscle.charAt(0).toUpperCase() + muscle.slice(1).replace('-', ' ')}
              </div>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getStatusColor(data.status)
                    }}
                  />
                </div>
              </div>

              <div className="muscle-stats">
                <div className="stat">
                  <span className="stat-label">Fatigue</span>
                  <span className="stat-value">{data.percentage}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span 
                    className="stat-status"
                    style={{ color: getStatusColor(data.status) }}
                  >
                    {getStatusText(data.status)}
                  </span>
                </div>
              </div>

              {data.daysSinceWorked !== null && (
                <div className="muscle-last-worked">
                  Last worked: {data.daysSinceWorked} day{data.daysSinceWorked !== 1 ? 's' : ''} ago
                </div>
              )}
              {data.daysSinceWorked === null && (
                <div className="muscle-last-worked not-worked">
                  Not worked in period
                </div>
              )}

              <div className="muscle-volume">
                Volume: {Math.round(data.volume).toLocaleString()} lbs
              </div>
            </div>
          );
        })}
      </div>

      <div className="section info-section">
        <h3 className="section-header">Fatigue Levels Explained</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="status-badge" style={{ backgroundColor: '#10b981' }}></span>
            <div>
              <strong>Ready / Recovered (0-100%)</strong>
              <p>Muscle is well recovered. Ready to train hard.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="status-badge" style={{ backgroundColor: '#f59e0b' }}></span>
            <div>
              <strong>Moderate (60-100%)</strong>
              <p>Muscle has been worked, but can handle another session.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="status-badge" style={{ backgroundColor: '#ef4444' }}></span>
            <div>
              <strong>Fatigued (100-150%)</strong>
              <p>Muscle is fatigued. Consider lighter work or prioritize other areas.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="status-badge" style={{ backgroundColor: '#b91c1c' }}></span>
            <div>
              <strong>Overworked (150%+)</strong>
              <p>Muscle is significantly fatigued. Focus on recovery or other muscles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
