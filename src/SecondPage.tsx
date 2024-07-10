// src/SecondPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Checkbox,
  ListItemIcon,
  Box
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import jsonData from './data.json'; // Assuming you saved the JSON data locally

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const columns: GridColDef[] = [
  { field: 'userId', headerName: 'User ID', width: 150 },
  { field: 'id', headerName: 'ID', width: 150 },
  { field: 'title', headerName: 'Title', width: 300 },
  { field: 'body', headerName: 'Body', width: 300 },
];

const DepartmentList: React.FC = () => {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (department: string) => {
    setOpen((prev) => ({ ...prev, [department]: !prev[department] }));
  };

  const handleSelect = (department: string, subDepartment?: string) => {
    if (subDepartment) {
      setSelected((prev) => ({ ...prev, [`${department}-${subDepartment}`]: !prev[`${department}-${subDepartment}`] }));
      
      const updatedSelected = { ...selected, [`${department}-${subDepartment}`]: !selected[`${department}-${subDepartment}`] };
      const allSelected = jsonData.find((dep) => dep.department === department)?.sub_departments.every((sd) => updatedSelected[`${department}-${sd}`]);

      if (allSelected) {
        setSelected((prev) => ({ ...prev, [department]: true }));
      } else {
        setSelected((prev) => ({ ...prev, [department]: false }));
      }
    } else {
      const current = !selected[department];
      setSelected((prev) => ({ ...prev, [department]: current }));
      jsonData.find((dep) => dep.department === department)?.sub_departments.forEach((sd) => {
        setSelected((prev) => ({ ...prev, [`${department}-${sd}`]: current }));
      });
    }
  };

  return (
    <List>
      {jsonData.map((department) => (
        <Box key={department.department}>
          <ListItem button onClick={() => handleToggle(department.department)}>
            <ListItemIcon>
              <Checkbox
                checked={selected[department.department] || false}
                onClick={() => handleSelect(department.department)}
              />
            </ListItemIcon>
            <ListItemText primary={department.department} />
            {open[department.department] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={open[department.department]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {department.sub_departments.map((subDepartment) => (
                <ListItem key={subDepartment} button sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Checkbox
                      checked={selected[`${department.department}-${subDepartment}`] || false}
                      onClick={() => handleSelect(department.department, subDepartment)}
                    />
                  </ListItemIcon>
                  <ListItemText primary={subDepartment} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </List>
  );
};

const SecondPage: React.FC = () => {
  const [data, setData] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userDetails = localStorage.getItem('userDetails');
    if (!userDetails) {
      alert('Please enter your details first');
      navigate('/');
    } else {
      axios.get('https://jsonplaceholder.typicode.com/posts')
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [navigate]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Data Table</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={data} columns={columns} paginationModel={{ page: 0, pageSize: 5 }} />
      </div>
      <Typography variant="h4" gutterBottom>Department List</Typography>
      <DepartmentList />
    </Container>
  );
};

export default SecondPage;
