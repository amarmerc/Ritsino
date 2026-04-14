import { useState } from 'react';
import UniversityRanking from './UniversityRanking';
import GlobalRanking from './GlobalRanking';
import UniversitiesRanking from './UniversitiesRanking';
import './Rankings.css';

const TABS = [
  { id: 'my-university', label: '🏫 Mi Universidad' },
  { id: 'global', label: '🌍 Global' },
  { id: 'universities', label: '🏆 Universidades' },
];

export default function Rankings() {
  const [activeTab, setActiveTab] = useState('my-university');

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <h2 className="neon-text">🏆 Rankings</h2>
      </div>

      <div className="rankings-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`rankings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'my-university' && <UniversityRanking />}
      {activeTab === 'global' && <GlobalRanking />}
      {activeTab === 'universities' && <UniversitiesRanking />}
    </div>
  );
}
