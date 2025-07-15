import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Avatar } from '@mui/material';
import WorkSearchBox from '../components/WorkSearchBox';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const WorkSearchResultPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const type = query.get('type') || '';
  const title = query.get('title') || '';

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      const params = [];
      if (type) params.push(`type=${type}`);
      if (title) params.push(`title=${encodeURIComponent(title)}`);
      params.push(`page=${page + 1}`);
      params.push(`limit=${rowsPerPage}`);
      const res = await fetch(`/api/works/search?${params.join('&')}`);
      const data = await res.json();
      setWorks(data.works || []);
      setTotal(data.pagination?.total || 0);
      setLoading(false);
    };
    fetchWorks();
  }, [type, title, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Work Search</Typography>
      <WorkSearchBox compact={false} defaultType={type} defaultTitle={title} />
      <Paper sx={{ mt: 4, borderRadius: 2, boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#222' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Cover</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {works.map((work) => (
                <TableRow
                  key={work._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/${work.type}/${work._id}`)}
                >
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={work.coverImages && work.coverImages[0] ? `${process.env.VITE_BACKEND_URL}${work.coverImages[0]}` : 'https://via.placeholder.com/60x90?text=No+Image'}
                      sx={{ width: 48, height: 72, bgcolor: '#eee' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={work.type === 'book' ? 'Book' : 'Screen'} color={work.type === 'book' ? 'primary' : 'secondary'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{work.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{work.year}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {works.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">No results found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
    </Box>
  );
};

export default WorkSearchResultPage; 