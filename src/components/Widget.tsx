import React, { type ReactNode } from 'react';
import './Widget.css';

interface WidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`widget ${className}`}>
      <div className="widget-header">
        <h2 className="widget-title">{title}</h2>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default Widget; 