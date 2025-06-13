import Api from '../Api';

/**
 * Fetch documents by user ID
 * @param {number} pageNumber - Current page number
 * @param {number} itemsPerPage - Number of items per page
 * @param {string} search - Search term for filtering documents
 * @returns {Promise<Object>} - Response containing documentMasters array
 */
export const fetchDocumentsByUserId = async (pageNumber = 1, itemsPerPage = 10, search = '') => {
  try {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const offset = (pageNumber - 1) * itemsPerPage;
    const requestData = {
      userID: userId,
      page: { offset, fetch: itemsPerPage },
      search: search ? { documentName: search } : undefined
    };

    console.log('Fetching documents with request:', requestData);
    const response = await Api.post('document/getbyuserid', requestData);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in fetchDocumentsByUserId:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch documents');
    }
    throw error;
  }
};

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

/**
 * Fetch documents that do not have questions prepared yet.
 * @returns {Promise<Object>} - Response containing documents in questionsNotPrepared array
 */
export const fetchDocumentsWithNoQuestions = async () => {
  try {
    const response = await Api.get('question/getdocumentswithnoquestion');

    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    // Validate the response structure
    if (!Array.isArray(response.data.questionsNotPrepared)) {
      throw new Error('Invalid response format: questionsNotPrepared array not found');
    }

    // Map the response to ensure consistent property names
    const mappedDocuments = response.data.questionsNotPrepared.map(doc => ({
      documentID: doc.documentID || 0,
      ojtid: doc.ojtid || 0, // Map ojtid to ojtid
      documentName: doc.documentName || ''
    }));

    return {
      questionsNotPrepared: mappedDocuments,
      header: response.data.header
    };
  } catch (error) {
    console.error('Error in fetchDocumentsWithNoQuestions:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch documents without questions');
    }
    throw error;
  }
};

/**
 * Create a new question
 * @param {Object} questionData - Question data to create
 * @returns {Promise<Object>} - Response containing created question
 */
export const createQuestion = async (questionData) => {
  try {
    // Validate that either documentID or ojtid is provided
    if (!questionData.documentID && !questionData.ojtid) {
      throw new Error('Either Document ID or OJT ID is required');
    }
    if (!questionData.requiredQuestions) {
      throw new Error('Total Number of Question in exam Greater than 0');
    }
    if (!questionData.questions || !Array.isArray(questionData.questions) || questionData.questions.length === 0) {
      throw new Error('At least one question is required');
    }

    // Format the request data
    const requestData = {
      documentID: Number(questionData.documentID) || 0,
      ojtid: Number(questionData.ojtid) || 0,
      requiredQuestions: Number(questionData.requiredQuestions),
      createdBy: String(questionData.createdBy),
      plantID: Number(questionData.plantID),
      electronicSignature: String(questionData.electronicSignature),
      signatureDate: String(questionData.signatureDate),
      questions: questionData.questions.map(q => ({
        questionText: String(q.questionText),
        isMandatory: Boolean(q.isMandatory),
        marks: Number(q.marks),
        createdBy: String(q.createdBy),
        electronicSignature: String(q.electronicSignature),
        signatureDate: String(q.signatureDate),
        options: q.options.map((opt, index) => ({
          optionText: String(opt.optionText),
          isCorrect: Boolean(opt.isCorrect),
          displayOrder: Number(index + 1)
        }))
      }))
    };

    console.log('Creating question with data:', requestData);
    const response = await Api.post('question/create', requestData);

    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in createQuestion:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to create question');
    }
    throw error;
  }
};

/**
 * Fetch questions by document ID
 * @param {number} documentId - ID of the document
 * @returns {Promise<Object>} - Response containing questions
 */
export const fetchQuestionsByDocumentId = async (documentId) => {
  try {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const response = await Api.get(`question/getbydocumentid/${documentId}`);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in fetchQuestionsByDocumentId:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch questions');
    }
    throw error;
  }
};

/**
 * Delete a question
 * @param {number} questionId - ID of the question to delete
 * @param {string} modifiedBy - User who is deleting the question
 * @returns {Promise<Object>} - Response containing deletion status
 */
export const deleteQuestion = async (questionId, modifiedBy) => {
  try {
    if (!questionId) {
      throw new Error('Question ID is required');
    }
    if (!modifiedBy) {
      throw new Error('Modified by user is required');
    }

    const response = await Api.post('question/delete', {
      questionID: questionId,
      modifiedBy: modifiedBy
    });

    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to delete question');
    }
    throw error;
  }
};

/**
 * Fetch question details by preparation ID.
 * @param {number} preparationId - ID of the question set to fetch.
 * @returns {Promise<Object>} - Response containing the question set details.
 */
export const fetchQuestionById = async (preparationId) => {
  try {
    if (!preparationId) {
      throw new Error('Preparation ID is required to fetch question details');
    }
    
    // Using the provided API endpoint
    const response = await Api.get(`question/getbypreparationid/${preparationId}`);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    // Assuming the response structure has a 'questions' array and potentially other details at the top level
    // Based on the previous context and the sample response, I will assume the full question set details
    // including documentID and requiredQuestions are present alongside the 'questions' array.
    // If only the 'questions' array is present, further API calls might be needed or the API structure needs clarification.
    // For now, I will assume the response data structure is suitable for setting editModeData directly
    // if the 'questions' array is present and not empty.

    if (response.data?.header?.errorCount === 0 && Array.isArray(response.data.questions)) {
      // The response structure seems to contain header and questions array at the top level.
      // Assuming documentID and requiredQuestions are also directly under response.data if needed.
      // Let's return the whole data object if questions are found and no errors.
      if (response.data.questions.length > 0) {
         return response.data; // Return the data as is, assuming it contains all needed fields
      } else {
         // Handle case where questions array is empty but no error, perhaps no questions prepared yet?
         // Returning the data allows the component to handle the empty questions array.
    return response.data;
      }
    } else {
      // Handle API error or no questions array
      const errorMessage = response.data?.header?.messages?.[0]?.messageText || 'Failed to fetch question details';
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('Error in fetchQuestionById:', error);
    // Re-throw the error so calling components can catch it
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    } else {
        throw error; // Throw the original error if no specific message is available
    }
  }
};

/**
 * Update a question set.
 * @param {Object} questionData - Updated question data including preparationID.
 * @returns {Promise<Object>} - Response containing update status.
 */
export const updateQuestion = async (questionData) => {
  try {
    if (!questionData || !questionData.preparationID) {
      throw new Error('Question data with Preparation ID is required for update');
    }

    // Format the request data exactly as per the working API request
    const requestData = {
      preparationID: Number(questionData.preparationID),
      documentID: Number(questionData.documentID),
      requiredQuestions: Number(questionData.requiredQuestions),
      modifiedBy: String(questionData.modifiedBy),
      plantID: Number(questionData.plantID),
      electronicSignature: String(questionData.electronicSignature),
      signatureDate: questionData.signatureDate, // Keep as ISO string
      deletedQuestionIDs: questionData.deletedQuestionIDs,
      deletedOptionIDs: questionData.deletedOptionIDs,
      questions: questionData.questions.map(q => ({
        questionID: Number(q.questionID),
        questionText: String(q.questionText),
        isMandatory: Boolean(q.isMandatory),
        marks: Number(q.marks),
        modifiedBy: String(q.modifiedBy),
        electronicSignature: String(q.electronicSignature),
        signatureDate: q.signatureDate, // Keep as ISO string
        options: q.options.map((opt, index) => ({
          optionID: Number(opt.optionID),
          optionText: String(opt.optionText),
          isCorrect: Boolean(opt.isCorrect),
          displayOrder: Number(index + 1)
        }))
      }))
    };
    console.log('Sending update request with data:', requestData);
    const response = await Api.post('question/update', requestData);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to update question');
    }
    throw error;
  }
};
