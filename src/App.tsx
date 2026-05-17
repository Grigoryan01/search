import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AboutPage } from './pages/AboutPage';
import { DetailsPanel } from './pages/DetailsPanel';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

const App = () => {
  const [triggerError, setTriggerError] = useState(false);

  if (triggerError) {
    throw new Error('Simulated application failure');
  }

  return (
    <Routes>
      <Route element={<AppLayout onTriggerError={() => setTriggerError(true)} />}>
        <Route
          path="/"
          element={<HomePage />}
        >
          <Route index element={<DetailsPanel />} />
        </Route>
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
