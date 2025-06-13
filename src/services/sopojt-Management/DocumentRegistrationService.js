import Api from '../Api';

// Create a new document
export const createDocument = async (formDataToSend) => {
  try {
    const response = await Api.post('document/create', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data; // Return API-provided error
    } else {
      throw error;
    }
  }
};

// Update an existing document
export const updateDocument = async (formDataToSend) => {
  try {
    const response = await Api.post('document/update', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data; // Return API-provided error
    } else {
      throw error;
    }
  }
};

// Fetch documents by user ID with search support
export const fetchDocumentsByUserId = async (payload) => {
  try {
    const response = await Api.post('document/getbyuserid', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};



// Delete a document by documentID
export const deleteDocument = async (documentID, modifiedBy) => {
  try {
    const response = await Api.post('document/delete', {
      documentID,
      modifiedBy,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data; // Return API error response
    } else {
      throw error;
    }
  }
};
// Fetch document by ID
export const fetchDocumentById = async (documentId) => {
  try {
    const response = await Api.get(`document/${documentId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};