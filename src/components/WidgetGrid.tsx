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

  // Helper function to scale widget dimensions for different breakpoints - PRESERVE positioning
  const scaleWidgetForBreakpoint = (layout: WidgetLayout, breakpoint: string, maxCols: number): WidgetLayout => {
    const { w, h, x, y } = layout;
    let scaledW = w;
    let scaledH = h;
    let scaledX = x;
    let scaledY = y;
    
    // More conservative scaling to preserve user layouts
    switch (breakpoint) {
      case 'xxs': // Mobile phones (2 columns)
        // Scale width more conservatively to preserve relative positioning
        scaledW = Math.min(w, 2);
        if (scaledW < w) {
          // Only reduce width if absolutely necessary
          scaledW = Math.max(1, Math.min(w, maxCols));
        }
        scaledH = h; // Preserve height
        scaledX = Math.min(x, Math.max(0, maxCols - scaledW)); // Preserve X as much as possible
        break;
        
      case 'xs': // Small tablets (4 columns)
        scaledW = Math.min(w, maxCols);
        scaledH = h;
        scaledX = Math.min(x, Math.max(0, maxCols - scaledW));
        break;
        
      case 'sm': // Tablets (6 columns)
        scaledW = Math.min(w, maxCols);
        scaledH = h;
        scaledX = Math.min(x, Math.max(0, maxCols - scaledW));
        break;
        
      case 'md': // Small laptops (10 columns)
        scaledW = Math.min(w, maxCols);
        scaledH = h;
        scaledX = Math.min(x, Math.max(0, maxCols - scaledW));
        break;
        
      case 'lg': // Large screens (12 columns)
      default:
        scaledW = w; // Keep original size
        scaledH = h;
        scaledX = x;
        break;
    }
    
    return {
      ...layout,
      w: scaledW,
      h: scaledH,
      x: scaledX,
      y: scaledY // Always preserve Y position
    };
  };

  // Generate responsive layouts for all breakpoints with MINIMAL repositioning
  const generateResponsiveLayouts = () => {
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
    const layouts: { [key: string]: Layout[] } = {};
    
    breakpoints.forEach(breakpoint => {
      const maxCols = columnCount[breakpoint];
      const scaledLayouts: Layout[] = [];
      
      items.forEach((item) => {
        const originalLayout = item.layout;
        let scaledLayout = scaleWidgetForBreakpoint(originalLayout, breakpoint, maxCols);
        
        // Only check for collisions and adjust if absolutely necessary
        const hasCollision = scaledLayouts.some(existingLayout => 
          !(scaledLayout.x >= existingLayout.x + existingLayout.w || // No horizontal overlap
            scaledLayout.x + scaledLayout.w <= existingLayout.x ||
            scaledLayout.y >= existingLayout.y + existingLayout.h || // No vertical overlap
            scaledLayout.y + scaledLayout.h <= existingLayout.y)
        );
        
        if (hasCollision) {
          // Only move if there's a collision - find nearest safe position
          scaledLayout = findNearestSafePosition(scaledLayout, scaledLayouts, maxCols);
        }
        
        scaledLayouts.push({
          ...scaledLayout,
          i: item.id
        });
      });
      
      layouts[breakpoint] = scaledLayouts;
    });
    
    return layouts;
  };

  // Helper function to find nearest safe position - preserve original position as much as possible
  const findNearestSafePosition = (
    targetLayout: WidgetLayout, 
    existingLayouts: Layout[], 
    maxCols: number
  ): WidgetLayout => {
    const { w, h, x: originalX, y: originalY } = targetLayout;
    
    // First try to keep the same Y position and adjust X minimally
    for (let xOffset = 0; xOffset <= maxCols; xOffset++) {
      for (const direction of [1, -1]) { // Try both directions
        const newX = originalX + (xOffset * direction);
        if (newX >= 0 && newX + w <= maxCols) {
          const testLayout = { x: newX, y: originalY, w, h };
          const hasCollision = existingLayouts.some(existing => 
            !(testLayout.x >= existing.x + existing.w || 
              testLayout.x + testLayout.w <= existing.x ||
              testLayout.y >= existing.y + existing.h || 
              testLayout.y + testLayout.h <= existing.y)
          );
          if (!hasCollision) {
            return { ...targetLayout, x: newX, y: originalY };
          }
        }
      }
    }
    
    // If same Y doesn't work, try minimal Y adjustments
    for (let yOffset = 1; yOffset <= 10; yOffset++) {
      const newY = originalY + yOffset;
      const testLayout = { x: originalX, y: newY, w, h };
      const hasCollision = existingLayouts.some(existing => 
        !(testLayout.x >= existing.x + existing.w || 
          testLayout.x + testLayout.w <= existing.x ||
          testLayout.y >= existing.y + existing.h || 
          testLayout.y + testLayout.h <= existing.y)
      );
      if (!hasCollision) {
        return { ...targetLayout, x: originalX, y: newY };
      }
    }
    
    // Fallback: place at bottom
    const maxY = Math.max(...existingLayouts.map(layout => layout.y + layout.h), 0);
    return { ...targetLayout, x: 0, y: maxY };
  };

  // Generate layouts object for react-grid-layout from items
  const layouts = generateResponsiveLayouts();

  // Calculate the minimum required height for the grid based on current breakpoint
  const calculateGridHeight = (breakpoint: string = 'lg') => {
    const breakpointLayouts = layouts[breakpoint];
    if (!breakpointLayouts || breakpointLayouts.length === 0) return 'auto';
    
    const maxY = Math.max(...breakpointLayouts.map(item => item.y + item.h));
    const rowHeight = 20; // Match the rowHeight prop
    const margin = 6; // Match the margin prop
    const containerPadding = 8; // Match the containerPadding prop
    
    // Calculate total height: (rows * rowHeight) + (rows * margin) + padding
    const totalHeight = (maxY * rowHeight) + ((maxY - 1) * margin) + (containerPadding * 2);
    return `${Math.max(totalHeight, 400)}px`; // Minimum height of 400px
  };

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
      rowHeight={20} // Reduced row height to minimize empty space
      containerPadding={[8, 8]} // Slightly increased padding for better spacing
      margin={[6, 6]} // Reduced margin between items to save space
      isDraggable={isDraggable}
      isResizable={isResizable}
      // Configure resize handles - enable all corners and edges for better UX
      resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'n', 'e', 'w']}
      draggableHandle=".drag-handle"
      draggableCancel=".no-drag"
      // LESS aggressive compaction settings to preserve user layouts
      preventCollision={true} // Prevent automatic collision resolution
      allowOverlap={false}
      // Use CSS transforms for better performance
      useCSSTransforms={true}
      // MINIMAL vertical compaction to preserve user positioning
      compactType="vertical"
      // Auto-size the container to content
      autoSize={true}
      // DISABLE additional compaction options to preserve user layouts
      verticalCompact={false} // Changed to false to preserve positions
      // Responsive grid height
      style={{ 
        minHeight: '400px',
        width: '100%'
      }}
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
      // Add responsive breakpoint change handler
      onBreakpointChange={(breakpoint: string, cols: number) => {
        console.log('Breakpoint changed to:', breakpoint, 'with', cols, 'columns - preserving user positions');
      }}
      // Handle window resize to ensure proper compaction
      onWindowResize={() => {
        // Force a layout compaction when window resizes
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }}
    >
      {/* Map items to divs with unique keys for react-grid-layout */}
      {items.map(item => (
        <Box 
          key={item.id} 
          sx={{ 
            height: '100%', 
            overflow: 'auto', // Allow scrolling within widgets if needed
            position: 'relative',
            // Make widgets more responsive with better scaling
            '& .widget': {
              height: '100%',
              '& .widget-content': {
                fontSize: {
                  xs: '0.8rem',
                  sm: '0.9rem', 
                  md: '1rem',
                  lg: '1rem'
                }
              }
            },
            // Ensure the resize handles are visible and properly styled
            '& .react-resizable-handle': {
              position: 'absolute',
              width: '20px',
              height: '20px',
              bottom: '0px',
              right: '0px',
              background: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAgNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem00LTRjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K") no-repeat',
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