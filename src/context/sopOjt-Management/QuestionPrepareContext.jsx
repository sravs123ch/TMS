import React, { createContext, useState, useCallback, useEffect } from 'react';
import { fetchQuestionsByDocumentId, deleteQuestion, fetchQuestionById } from '../../services/sopojt-Management/QuestionPrepareService';

export const QuestionPrepareContext = createContext();

export const QuestionPrepareProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModeData, setEditModeData] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(null);

  // Load questions for a specific document
  const loadQuestions = useCallback(async (documentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchQuestionsByDocumentId(documentId);
      if (response && response.questions) {
        setQuestions(response.questions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load question data for editing
  const loadQuestionForEdit = useCallback(async (preparationId, documentID, requiredQuestions, docName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get documentID and requiredQuestions from arguments or sessionStorage
      let docId = documentID;
      let reqQuestions = requiredQuestions;
      let docNm = docName;

      if (docId === undefined || reqQuestions === undefined || docNm === undefined) {
        const persistedData = sessionStorage.getItem('editQuestionData');
        if (persistedData) {
          try {
            const parsedData = JSON.parse(persistedData);
            docId = docId === undefined ? parsedData.documentID : docId;
            reqQuestions = reqQuestions === undefined ? parsedData.requiredQuestions : reqQuestions;
            docNm = docNm === undefined ? parsedData.documentName : docNm;
          } catch (err) {
            console.error('Error parsing persisted question data for docId/reqQuestions:', err);
          }
        }
      }

      // If we still don't have them, we might need to fetch minimal info or rely on the grid
      // For now, proceed with potentially undefined values, the EditQuestionPrepare component
      // is updated to wait for them.
      
      // Fetch the questions array for the preparationId
      const questionsResponse = await fetchQuestionById(preparationId);
      
      if (questionsResponse.header?.errorCount === 0 && Array.isArray(questionsResponse.questions)) {
        const questionData = {
          preparationID: preparationId,
          documentID: docId, // Use potentially retrieved documentID
          requiredQuestions: reqQuestions, // Use potentially retrieved requiredQuestions
          documentName: docNm,
          questions: questionsResponse.questions.map(q => ({
            questionID: q.questionID,
            questionText: q.questionText,
            options: q.options.map(opt => ({
              optionID: opt.optionID, 
              optionText: opt.optionText,
              isCorrect: opt.isCorrect
            })),
            correctAnswer: q.options.find(opt => opt.isCorrect)?.optionText || '',
            mandatory: q.isMandatory,
            marks: q.marks,
             modifiedBy: q.modifiedBy || '',
             electronicSignature: q.electronicSignature || '',
             signatureDate: q.signatureDate || '',
          }))
        };
        setEditModeData(questionData);
        setDocumentName(docNm || '');
        setTotalQuestions(reqQuestions || null);
        // Always update sessionStorage with the latest fetched data
        sessionStorage.setItem('editQuestionData', JSON.stringify({ ...questionData, documentName: docNm }));
      } else {
        const errorMessage = questionsResponse.header?.messages?.[0]?.messageText || 'Failed to load question data or no questions found.';
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message || 'Failed to load question data');
      console.error('Error loading question data:', err);
       // Clear editModeData on error to prevent showing stale data
       setEditModeData(null);
       setDocumentName('');
       setTotalQuestions(null);
       sessionStorage.removeItem('editQuestionData');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear edit mode data
  const clearEditModeData = useCallback(() => {
    setEditModeData(null);
    setDocumentName('');
    setTotalQuestions(null);
    sessionStorage.removeItem('editQuestionData');
  }, []);

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = sessionStorage.getItem('editQuestionData');
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData);
        setEditModeData(parsed);
        setDocumentName(parsed.documentName || '');
        setTotalQuestions(parsed.requiredQuestions || null);
      } catch (err) {
        console.error('Error parsing persisted question data:', err);
        sessionStorage.removeItem('editQuestionData');
      }
    }
  }, []);

  // Delete a question
  const removeQuestion = useCallback(async (questionId, modifiedBy) => {
    try {
      setLoading(true);
      setError(null);
      await deleteQuestion(questionId, modifiedBy);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err) {
      setError(err.message || 'Failed to delete question');
      console.error('Error deleting question:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new question
  const addQuestion = useCallback((question) => {
    setQuestions(prev => [...prev, question]);
  }, []);

  // Update an existing question
  const updateQuestion = useCallback((updatedQuestion) => {
    setQuestions(prev => prev.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
  }, []);

  const value = {

    questions,
    selectedQuestion,
    loading,
    error, 
    editModeData,
    setSelectedQuestion,
    loadQuestions,
    loadQuestionForEdit,
    clearEditModeData,
    removeQuestion,
    addQuestion,
    updateQuestion,
    setError,
    documentName,
    totalQuestions
  };

  return (
    <QuestionPrepareContext.Provider value={value}>
      {children}
    </QuestionPrepareContext.Provider>
  );
}; 