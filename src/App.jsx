import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PersonPage from './components/PersonPage';
import CommunPage from './components/CommunPage';
import { loadPerson, loadCommun } from './utils/storage';

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [alex, setAlex] = useState(() => loadPerson('alex'));
  const [aurelie, setAurelie] = useState(() => loadPerson('aurelie'));
  const [commun, setCommun] = useState(() => loadCommun());

  return (
    <div>
      <Navbar active={page} onNavigate={setPage} />
      <main>
        {page === 'Dashboard' && (
          <Dashboard alex={alex} aurelie={aurelie} commun={commun} />
        )}
        {page === 'Alex' && (
          <PersonPage name="alex" data={alex} onChange={setAlex} />
        )}
        {page === 'Aurélie' && (
          <PersonPage name="aurelie" data={aurelie} onChange={setAurelie} />
        )}
        {page === 'Commun' && (
          <CommunPage
            data={commun}
            alexSalary={parseFloat(alex.salary) || 0}
            aurelieSalary={parseFloat(aurelie.salary) || 0}
            onChange={setCommun}
          />
        )}
      </main>
    </div>
  );
}
