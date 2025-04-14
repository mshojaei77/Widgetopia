import React, { ReactNode } from 'react';
import './WidgetGrid.css';

interface WidgetGridProps {
  children: ReactNode;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ children }) => {
  return (
    <div className="widget-grid">
      {children}
    </div>
  );
};

export default WidgetGrid; 