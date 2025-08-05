import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SlipInvoice from '../components/SlipInvoice';
import {
  LinearProgress,
  Box,
  Container,
  Typography,
  Divider,
  Grid,
} from '@mui/material';

const SlipPage = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://inventory-system-back-end-production.up.railway.app/api/slips')
      .then(res => {
        setSlips(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch slips:', err);
        setLoading(false);
      });
  }, []);

  const latestSlip = slips[0];
  const oldSlips = slips.slice(1); // All except the latest

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <Container maxWidth="md">
        <Typography variant="h5" gutterBottom>
          Latest Slip
        </Typography>

        {loading ? (
          <Box sx={{ width: '100%', mt: 4 }}>
            <LinearProgress />
          </Box>
        ) : latestSlip ? (
          <SlipInvoice slip={latestSlip} />
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            No slip found.
          </Typography>
        )}

        {/* Divider & Old Slips */}
        {oldSlips.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" gutterBottom>
              Previous Slips
            </Typography>

            <Grid container spacing={2}>
              {oldSlips.map((slip, index) => (
                <Grid item xs={12} key={slip._id || index}>
                  <SlipInvoice slip={slip} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </div>
  );
};

export default SlipPage;
