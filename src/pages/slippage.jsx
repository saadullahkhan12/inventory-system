import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SlipInvoice from '../components/SlipInvoice';
// Assuming you have a SlipInvoice component to display the slip

const SlipPage = () => {
  const [slip, setSlip] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/slips')
      .then(res => {
        setSlip(res.data[0]); // Get latest slip
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {slip ? <SlipInvoice slip={slip} /> : <p className="text-center">Loading invoice...</p>}
    </div>
  );
};

export default SlipPage;
