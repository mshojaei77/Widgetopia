import React, { useState, useEffect } from 'react';
import './App.css';
import Clock from './widgets/Clock';
import Weather from './widgets/Weather';
import TodoList from './widgets/TodoList';
import QuickLinks from './widgets/QuickLinks';
import WidgetGrid from './components/WidgetGrid';

const App: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    } else {
      newGreeting = 'Good evening';
    }
    
    setGreeting(newGreeting);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Widgetopia</h1>
        <p className="greeting">{greeting}</p>
      </header>
      
      <WidgetGrid>
        <Clock />
        <Weather />
        <TodoList />
        <QuickLinks />
      </WidgetGrid>

      <footer className="app-footer">
        <p>Widgetopia - Your customized new tab experience</p>
      </footer>
    </div>
  );
};

export default App; 