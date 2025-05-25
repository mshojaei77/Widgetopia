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
      // Configure resize handles - enable all corners and edges for better UX
      resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'n', 'e', 'w']}
      draggableHandle=".drag-handle"
      draggableCancel=".no-drag"
      // Prevent collision for better resizing experience
      preventCollision={false}
      // Allow overlap for more flexible layouts
      allowOverlap={false}
      // Use CSS transforms for better performance
      useCSSTransforms={true}
      // Ensure proper compaction
      compactType="vertical"
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
      onDragStart={onDragStart}
    >
      {/* Map items to divs with unique keys for react-grid-layout */}
      {items.map(item => (
        <Box 
          key={item.id} 
          sx={{ 
            height: '100%', 
            overflow: 'hidden',
            position: 'relative',
            // Ensure the resize handles are visible and properly styled
            '& .react-resizable-handle': {
              position: 'absolute',
              width: '20px',
              height: '20px',
              bottom: '0px',
              right: '0px',
              background: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAgNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem00LTRjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K") no-repeat',
              backgroundPosition: 'bottom right',
              padding: '0 3px 3px 0',
              backgroundRepeat: 'no-repeat',
              backgroundOrigin: 'content-box',
              boxSizing: 'border-box',
              cursor: 'se-resize',
              zIndex: 15,
              opacity: isResizable ? 1 : 0,
              transition: 'opacity 0.2s ease'
            },
            // Style different resize handles
            '& .react-resizable-handle-sw': {
              bottom: '0px',
              left: '0px',
              cursor: 'sw-resize',
              transform: 'rotate(90deg)'
            },
            '& .react-resizable-handle-ne': {
              top: '0px',
              right: '0px',
              cursor: 'ne-resize',
              transform: 'rotate(180deg)'
            },
            '& .react-resizable-handle-nw': {
              top: '0px',
              left: '0px',
              cursor: 'nw-resize',
              transform: 'rotate(270deg)'
            },
            '& .react-resizable-handle-s': {
              bottom: '0px',
              left: '50%',
              marginLeft: '-10px',
              cursor: 's-resize'
            },
            '& .react-resizable-handle-n': {
              top: '0px',
              left: '50%',
              marginLeft: '-10px',
              cursor: 'n-resize'
            },
            '& .react-resizable-handle-e': {
              top: '50%',
              right: '0px',
              marginTop: '-10px',
              cursor: 'e-resize'
            },
            '& .react-resizable-handle-w': {
              top: '50%',
              left: '0px',
              marginTop: '-10px',
              cursor: 'w-resize'
            }
          }}
        >
          {item.component}
        </Box>
      ))}
    </ResponsiveGridLayout>
  );
};

export default WidgetGrid; 