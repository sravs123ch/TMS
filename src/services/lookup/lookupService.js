import Api from '../Api';

// Fetch list of document types
export const fetchDocumentTypes = async () => {
    try {
      const response = await Api.get('lookup/documenttype');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data; // Return API-provided error
      } else {
        throw error;
      }
    }
  };

  export const fetchEvaluationTypes = async () => {
    try {
      const response = await Api.get('lookup/evaluationtype');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data; // Return API-provided error
      } else {
        throw error;
      }
    }
  };