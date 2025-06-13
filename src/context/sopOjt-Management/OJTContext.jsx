import React, { createContext, useState, useContext } from 'react';
import { fetchOJTByUserId, fetchOJTById } from '../../services/sopojt-Management/OJTMasterService'; // Import necessary service functions

const OJTContext = createContext(null);

export const OJTProvider = ({ children }) => {
  const [ojtData, setOjtData] = useState([]); // For list data
  const [singleOJTData, setSingleOJTData] = useState(null); // For single OJT data
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOJTListData = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOJTByUserId(payload);
      if (res?.header?.errorCount === 0) {
        setOjtData(res.onJobTrainingMaster || []);
        setTotalRecords(res.totalRecord || 0);
      } else {
        setError(res?.header?.messages?.[0]?.messageText || 'Failed to fetch OJT list data.');
        setOjtData([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error fetching OJT list data:', err);
      setError('An error occurred while fetching OJT list data.');
      setOjtData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleOJTData = async (ojtId) => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetchOJTById(ojtId);
        // Assuming the response for a single OJT is the object itself or within a single-item array
        const fetchedData = res?.onJobTrainingMaster?.[0] || res;

        if (fetchedData) {
            setSingleOJTData(fetchedData);
            return fetchedData; // Return data for immediate use if needed
        } else {
            setError('OJT data not found.');
            setSingleOJTData(null);
            return null;
        }
    } catch (err) {
        console.error('Error fetching single OJT data:', err);
        setError('An error occurred while fetching single OJT data.');
        setSingleOJTData(null);
        throw err; // Re-throw to allow catching in the component if needed
    } finally {
        setLoading(false);
    }
  };

  return (
    <OJTContext.Provider value={{
      ojtData,
      singleOJTData,
      totalRecords,
      loading,
      error,
      fetchOJTListData,
      fetchSingleOJTData,
    }}>
      {children}
    </OJTContext.Provider>
  );
};

export const useOJT = () => {
  const context = useContext(OJTContext);
  if (!context) {
    throw new Error('useOJT must be used within an OJTProvider');
  }
  return context;
};
