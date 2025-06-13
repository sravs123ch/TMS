import Api from '../Api';

/**
 * Fetches all questions pending approval.
 * @returns {Promise<Object>} - Response containing the list of questions pending approval and header information.
 */
export const fetchPendingQuestions = async () => {
  try {
    // Assuming the API endpoint relative to base URL is 'question/getallpendingapproval'
    const response = await Api.get('question/getallpendingapproval');

    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in fetchPendingQuestions:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch pending questions');
    }
    throw error;
  }
};


export const getQuestionsByPreparationId = async (preparationId) => {
  try {
    const response = await Api.get(`question/getbypreparationid/${preparationId}`);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in getQuestionsByPreparationId:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch questions');
    }
    throw error;
  }
};


export const updateQuestionStatus = async (data) => {
  try {
    const response = await Api.post('question/updatestatus', data);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in updateQuestionStatus:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to update question status');
    }
    throw error;
  }
};
