import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Menu,
  IconButton,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Check as CheckIcon } from '@mui/icons-material';
import { createDropdownGlassStyle, createSelectFieldGlassStyle, createMenuItemGlassStyle } from '../theme/glassTheme';
import type { SelectChangeEvent as TypeSelectChangeEvent } from '@mui/material/Select';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  category?: string;
}

interface EnhancedDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  showCategories?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  className?: string;
}

const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  multiple = false,
  size = 'medium',
  variant = 'outlined',
  showCategories = false,
  maxHeight = 300,
  className = '',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Group options by category if showCategories is true
  const groupedOptions = React.useMemo(() => {
    if (!showCategories) return { '': options };
    
    return options.reduce((groups, option) => {
      const category = option.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(option);
      return groups;
    }, {} as Record<string, DropdownOption[]>);
  }, [options, showCategories]);

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return groupedOptions;
    
    const filtered: Record<string, DropdownOption[]> = {};
    Object.entries(groupedOptions).forEach(([category, categoryOptions]) => {
      const matchingOptions = categoryOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingOptions.length > 0) {
        filtered[category] = matchingOptions;
      }
    });
    return filtered;
  }, [groupedOptions, searchTerm]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <FormControl 
      variant={variant} 
      size={size} 
      disabled={disabled}
      className={`enhanced-dropdown ${className}`}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        label={label}
        multiple={multiple}
        sx={{
          ...createSelectFieldGlassStyle(),
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              ...createDropdownGlassStyle(),
              maxHeight: maxHeight,
              minWidth: 'auto',
              width: 'auto',
              maxWidth: '400px',
              '& .MuiList-root': {
                padding: '8px',
              }
            }
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          autoWidth: true,
        }}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                {placeholder}
              </Typography>
            );
          }
          
          if (multiple && Array.isArray(selected)) {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const option = options.find(opt => opt.value === val);
                  return (
                    <Chip
                      key={val}
                      label={option?.label || val}
                      size="small"
                      sx={{
                        height: 24,
                        backgroundColor: 'var(--glass-dropdown-item-selected-bg)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        color: 'var(--text-light)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--text-light)',
                        }
                      }}
                    />
                  );
                })}
              </Box>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedOption?.icon}
              <Typography variant="body2">
                {selectedOption?.label || selected}
              </Typography>
            </Box>
          );
        }}
      >
        {Object.entries(filteredOptions).map(([category, categoryOptions]) => [
          // Category header (if categories are shown and category name exists)
          showCategories && category && (
            <MenuItem key={`category-${category}`} disabled sx={{ opacity: 0.8, fontWeight: 600 }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {category}
              </Typography>
            </MenuItem>
          ),
          // Category options
          ...categoryOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              sx={{
                ...createMenuItemGlassStyle(),
                minHeight: option.description ? 56 : 40,
                alignItems: 'flex-start',
                py: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                {option.icon}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: value === option.value ? 500 : 400 }}>
                    {option.label}
                  </Typography>
                  {option.description && (
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                      {option.description}
                    </Typography>
                  )}
                </Box>
                {value === option.value && (
                  <CheckIcon sx={{ fontSize: 18, color: 'var(--primary-color)' }} />
                )}
              </Box>
            </MenuItem>
          )),
          // Category divider (if not the last category)
          showCategories && category && Object.keys(filteredOptions).indexOf(category) < Object.keys(filteredOptions).length - 1 && (
            <Divider key={`divider-${category}`} sx={{ my: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          )
        ]).flat().filter(Boolean)}
        
        {Object.keys(filteredOptions).length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              No options found
            </Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default EnhancedDropdown;

// Example usage component for demonstration
export const DropdownShowcase: React.FC = () => {
  const [selectedValue, setSelectedValue] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const sampleOptions: DropdownOption[] = [
    {
      value: 'option1',
      label: 'Enhanced Glass Effect',
      description: 'Improved blur and contrast for better readability',
      category: 'Visual Effects'
    },
    {
      value: 'option2',
      label: 'Better Accessibility',
      description: 'WCAG compliant contrast ratios and keyboard navigation',
      category: 'Accessibility'
    },
    {
      value: 'option3',
      label: 'Smooth Animations',
      description: 'Fluid transitions and micro-interactions',
      category: 'Animations'
    },
    {
      value: 'option4',
      label: 'Responsive Design',
      description: 'Works perfectly on all screen sizes',
      category: 'Responsive'
    },
    {
      value: 'option5',
      label: 'Custom Styling',
      description: 'Easily customizable with CSS variables',
      category: 'Customization'
    },
  ];

  const categoryOptions: DropdownOption[] = [
    { value: 'visual', label: 'Visual Effects', category: 'UI' },
    { value: 'accessibility', label: 'Accessibility', category: 'UX' },
    { value: 'performance', label: 'Performance', category: 'Technical' },
    { value: 'responsive', label: 'Responsive Design', category: 'UI' },
  ];

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ color: 'var(--text-light)' }}>
        Enhanced Dropdown Showcase
      </Typography>
      
      <EnhancedDropdown
        options={sampleOptions}
        value={selectedValue}
        onChange={setSelectedValue}
        label="Select Feature"
        placeholder="Choose a feature to highlight"
        showCategories
      />
      
      <EnhancedDropdown
        options={categoryOptions}
        value={selectedCategory}
        onChange={setSelectedCategory}
        label="Category"
        placeholder="Select category"
        size="small"
        showCategories
      />
    </Box>
  );
}; 