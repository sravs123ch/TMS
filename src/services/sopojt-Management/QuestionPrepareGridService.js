import Api from '../Api';

// Fetch questions with pagination and search support
export const fetchQuestions = async (payload) => {
  try {
    const response = await Api.post('question/getbyuserid', payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Delete a question set
export const deleteQuestion = async (preparationId) => {
  try {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const response = await Api.post('question/delete', {
      preparationID: preparationId,
      modifiedBy: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};