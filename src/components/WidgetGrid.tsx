import React from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Box } from '@mui/material'; // Import Box for wrapping
import type { WidgetGridItem, WidgetLayout } from '../types'; // Import shared types
// Removed: import './WidgetGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  items: WidgetGridItem[]; // Changed from children to items
  // Add onLayoutChange prop if you want to save layout changes
  onLayoutChange?: (layout: Layout[]) => void;
  isDraggable?: boolean; // Add isDraggable prop
  isResizable?: boolean; // Add isResizable prop
  // Add column count prop
  columnCount?: Record<string, number>;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ 
  items, 
  onLayoutChange,
  isDraggable = true, // Default to true
  isResizable = true, // Default to true
  // Column configuration matching what's in the screenshot
  columnCount = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
}) => {

  // Generate layouts object for react-grid-layout from items
  const layouts = items.reduce((acc, item) => {
    // Assuming a single breakpoint 'lg' for simplicity, expand as needed
    acc.lg = acc.lg || [];
    acc.lg.push({ ...item.layout, i: item.id }); // Add unique id 'i'
    return acc;
  }, {} as { [key: string]: WidgetLayout[] });

  // Prevent dragging from interactive elements within widgets
  const onDragStart = (
      layout: Layout[],
      oldItem: Layout,
      newItem: Layout,
      placeholder: Layout,
      e: MouseEvent,
      element: HTMLElement
  ) => {
    const target = e.target as HTMLElement;
    // Check if the clicked element or its parent is interactive
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button, a, input, textarea, [role="button"], [role="checkbox"]')
    ) {
      // Prevent dragging if the click originated from an interactive element
      e.stopPropagation();
      return false;
    }
    // Allow drag otherwise (e.g., clicking on Paper background)
    return true;
  };

  return (
    <ResponsiveGridLayout
      className="widget-grid" // Keep class for potential basic structure styling
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={columnCount}
      rowHeight={30} // Exact row height from screenshot
      containerPadding={[5, 5]} // Padding around the grid matching screenshot
      margin={[8, 8]} // Margin between items matching screenshot
      isDraggable={isDraggable}
      isResizable={isResizable}
      draggableCancel=".no-drag"
      onLayoutChange={(layout, allLayouts) => {
        if (onLayoutChange) {
          // Only save the layout for the current breakpoint (e.g., 'lg')
          // Find the relevant breakpoint key from allLayouts
          const breakpoint = Object.keys(allLayouts).find(key => allLayouts[key] === layout);
          if (breakpoint) {
             // console.log('Layout changed for:', breakpoint, layout);
             onLayoutChange(layout);
          }
        }
      }}
      // Use Measures to prevent occasional width calculation issues
      useCSSTransforms={true}
    >
      {/* Map items to divs with unique keys for react-grid-layout */}
      {items.map(item => (
        <Box key={item.id} sx={{ height: '100%', overflow: 'hidden' }}>
          {item.component}
        </Box>
      ))}
    </ResponsiveGridLayout>
  );
};

export default WidgetGrid; 