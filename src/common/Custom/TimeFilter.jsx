import React, { useState } from 'react';
import { Button, MenuItem, FormControl, Select, Box } from '@mui/material';
import filterIcon from '../../assets/images/filter.svg';

const TimeFilter = ({ selected, onApply }) => {
  // Default to "today"
 
  
  const handleChange = (e) => onApply(e.target.value);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <FormControl size="small">
      <Select value={selected} onChange={handleChange} sx={{ minWidth: 150 }}>
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="yesterday">Yesterday</MenuItem>
        <MenuItem value="this_week">This Week</MenuItem>
        <MenuItem value="this_month">This Month</MenuItem>
        <MenuItem value="this_year">This Year</MenuItem>
      </Select>
    </FormControl>
    <Button variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img src={filterIcon} alt="filter" /> Apply
    </Button>
  </Box>
  );
};

export default TimeFilter;
