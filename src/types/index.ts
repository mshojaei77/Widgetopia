/**
 * Represents a quick link item.
 */
export interface QuickLink {
  id: number;
  title: string;
  url: string;
  /** Icon can be a character/emoji or a URL to a favicon */
  icon?: string; // URL or initial/emoji
  /** Background color used if icon is not a URL (optional) */
  color?: string; // Background color if no icon
}

/**
 * Represents the layout properties for a widget in the grid.
 */
export interface WidgetLayout {
  i: string; // Unique identifier (matches widget id)
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  isBounded?: boolean;
  static?: boolean;
}

/**
 * Represents the configuration for a renderable widget.
 */
export interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>; // Or specify more concrete props
  defaultLayout: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
}

/**
 * Props for the WidgetGrid component.
 */
export interface WidgetGridItem {
  id: string;
  component: JSX.Element;
  layout: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
}

// Define the Todo type
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
} 