import { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  InputField,
  EnhancedInputField,
  CustomAsyncSelect,
  CheckboxField,
} from "../../../components/common/ui/FormFields";
import {
  fetchDocumentsByUserId,
  createQuestion,
  fetchQuestionById,
  updateQuestion,
  fetchDocumentsWithNoQuestions,
} from "../../../services/sopojt-Management/QuestionPrepareService";
import { QuestionPrepareContext } from "../../../context/sopOjt-Management/QuestionPrepareContext";

const MAX_QUESTION_LENGTH = 200;
const MAX_OPTION_LENGTH = 100;

const QuestionPrepare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  console.log("QuestionPrepare Component loaded. ID from URL:", id);
  console.log("Is Edit Mode:", isEditMode);

  const {
    questions,
    loading: contextLoading,
    error: contextError,
    addQuestion,
    setError: setContextError,
  } = useContext(QuestionPrepareContext);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [documentInfo, setDocumentInfo] = useState({
    linkedDocument: "",
    totalQuestions: 1,
    documentID: 0,
    ojtid: 0,
    type: "",
  });

  const [questionsForms, setQuestionsForms] = useState([
    {
      questionText: "",
      options: [
        { optionText: "", optionID: 0, isCorrect: false },
        { optionText: "", optionID: 0, isCorrect: false },
      ],
      correctAnswer: "",
      mandatory: false,
      marks: 0,
    },
  ]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const lastQuestionRef = useRef(null);

  const loadDocuments = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isEditMode) {
        setDocuments([]);
        setLoading(false);
        return;
      } else {
        response = await fetchDocumentsWithNoQuestions();
        console.log("Response from fetchDocumentsWithNoQuestions:", response);
      }

      if (isMounted) {
        if (response && Array.isArray(response.questionsNotPrepared)) {
          const documentsList = response.questionsNotPrepared;
          console.log("Documents list:", documentsList);

          // Filter out invalid documents
          const validDocuments = documentsList.filter((doc) => {
            const hasValidDocId = doc.documentID !== 0;
            const hasValidojtid = doc.ojtid !== 0;
            return doc && (hasValidDocId || hasValidojtid);
          });

          console.log("Valid documents:", validDocuments);
          setDocuments(validDocuments);

          if (validDocuments.length === 0) {
            setError("No documents found that need questions.");
          }
        } else {
          console.log("Invalid response structure:", response);
          setError("No documents found that need questions.");
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error("Error in loadDocuments:", err);
        setError(err.message || "Failed to load documents");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    if (!isEditMode) {
      const cleanup = loadDocuments();
      return () => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      };
    }
  }, [currentPage, searchTerm, isEditMode]);

  useEffect(() => {
    if (isEditMode && id) {
      loadQuestionData();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (questionsForms.length > 1 && lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [questionsForms.length]);

  const loadQuestionData = async () => {
    console.log("Attempting to load question data for ID:", id);
    try {
      setLoading(true);
      const data = await fetchQuestionById(id);
      console.log("Response from fetchQuestionById:", data);

      if (
        data.header?.errorCount === 0 &&
        data.questions &&
        data.questions.length > 0
      ) {
        const questionData = data.questions[0];
        setDocumentInfo({
          linkedDocument: questionData.documentID,
          totalQuestions: questionData.requiredQuestions,
        });

        setQuestionsForms(
          questionData.questions.map((q) => ({
            questionID: q.questionID,
            questionText: q.questionText,
            options: q.options.map((opt) => ({
              optionID: opt.optionID,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
            })),
            correctAnswer:
              q.options.find((opt) => opt.isCorrect)?.optionText || "",
            mandatory: q.isMandatory,
            marks: q.marks,
          }))
        );

        setDocumentInfo((prev) => ({
          ...prev,
          preparationID: data.preparationID,
          linkedDocument: data.documentID,
        }));
      } else {
        console.error(
          "API returned an error or no questions found when fetching question data:",
          data.header?.messages?.[0]?.messageText ||
            "No questions array in response."
        );
        toast.error("Failed to load question data or no questions found.");
        navigate("/document-management/questioner-preparation");
      }
    } catch (error) {
      console.error("Error loading question data:", error);
      toast.error("Error loading question data");
      navigate("/document-management/questioner-preparation");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questionsForms];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      optionText: value,
    };
    setQuestionsForms(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questionsForms];
    if (updatedQuestions[questionIndex].options.length < 4) {
      updatedQuestions[questionIndex].options.push({
        optionText: "",
        optionID: 0,
        isCorrect: false,
      });
      setQuestionsForms(updatedQuestions);
    } else {
      toast.warning("Maximum 4 options allowed.");
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questionsForms];
    if (updatedQuestions[questionIndex].options.length > 2) {
      const options = updatedQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      if (
        updatedQuestions[questionIndex].correctAnswer ===
        updatedQuestions[questionIndex].options[optionIndex].optionText
      ) {
        updatedQuestions[questionIndex].correctAnswer = "";
      }
      updatedQuestions[questionIndex].options = options;
      setQuestionsForms(updatedQuestions);
    } else {
      toast.warning("Minimum 2 options required.");
    }
  };

  const handleQuestionTextChange = (questionIndex, value) => {
    const updatedQuestions = [...questionsForms];
    updatedQuestions[questionIndex].questionText = value;
    setQuestionsForms(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...questionsForms];
    updatedQuestions[questionIndex].correctAnswer = value;
    setQuestionsForms(updatedQuestions);
  };

  const handleMandatoryChange = (questionIndex, checked) => {
    const maxMandatory = parseInt(documentInfo.totalQuestions) || 0;
    const currentMandatoryCount = questionsForms.filter(
      (q) => q.mandatory
    ).length;

    if (checked && currentMandatoryCount >= maxMandatory) {
      toast.warning(
        `You can only mark up to ${maxMandatory} questions as mandatory.`
      );
      return;
    }

    const updatedQuestions = [...questionsForms];
    updatedQuestions[questionIndex].mandatory = checked;
    setQuestionsForms(updatedQuestions);
  };

  const handleMarksChange = (questionIndex, value) => {
    const updatedQuestions = [...questionsForms];
    updatedQuestions[questionIndex].marks = value;
    setQuestionsForms(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestionsForms([
      ...questionsForms,
      {
        questionText: "",
        options: [
          { optionText: "", optionID: 0, isCorrect: false },
          { optionText: "", optionID: 0, isCorrect: false },
        ],
        correctAnswer: "",
        mandatory: false,
        marks: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (questionIndex) => {
    if (questionsForms.length <= documentInfo.totalQuestions) {
      toast.warning(
        `Cannot remove questions. Minimum ${documentInfo.totalQuestions} questions required.`
      );
      return;
    }

    const updatedQuestions = questionsForms.filter(
      (_, index) => index !== questionIndex
    );
    setQuestionsForms(updatedQuestions);
    setSelectedOptions((prev) => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
  };

  useEffect(() => {
    const requiredQuestions = parseInt(documentInfo.totalQuestions) || 0;
    let currentQuestionsCount = questionsForms.length;

    if (requiredQuestions > 0) {
      if (currentQuestionsCount < requiredQuestions) {
        const newQuestions = Array.from(
          { length: requiredQuestions - currentQuestionsCount },
          () => ({
            questionText: "",
            options: [
              { optionText: "", optionID: 0, isCorrect: false },
              { optionText: "", optionID: 0, isCorrect: false },
            ],
            correctAnswer: "",
            mandatory: false,
            marks: 0,
          })
        );
        setQuestionsForms([...questionsForms, ...newQuestions]);
      }
    }
  }, [documentInfo.totalQuestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setContextError(null);

      const userDataStr = sessionStorage.getItem("userData");
      const plantId = sessionStorage.getItem("plantId");
      const userId = sessionStorage.getItem("userId");

      let userData;
      try {
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      } catch (err) {
        console.error("Error parsing userData:", err);
        userData = null;
      }

      const missingInfo = [];
      if (!userData) missingInfo.push("userData");
      if (!plantId) missingInfo.push("plantId");
      if (!userId) missingInfo.push("userId");

      if (missingInfo.length > 0) {
        throw new Error(
          `Missing required user information: ${missingInfo.join(
            ", "
          )}. Please log in again.`
        );
      }

      const userEmail = userData.emailID || userData.loginID;
      const userName = `${userData.firstName} ${userData.lastName}`.trim();

      if (!isEditMode && !documentInfo.linkedDocument) {
        throw new Error("Please select a document");
      }

      const [type, id] = documentInfo.linkedDocument.split("-");
      const selectedDoc = documents.find(
        (doc) =>
          (type === "doc" && doc.documentID === Number(id)) ||
          (type === "ojt" && doc.ojtid === Number(id))
      );

      if (!isEditMode && !selectedDoc) {
        throw new Error(
          "Selected document not found. Please select a valid document."
        );
      }

      const currentDate = new Date().toISOString();

      const questionDataToSend = {
        preparationID: isEditMode ? parseInt(id) : 0,
        documentID: type === "doc" ? Number(id) : 0,
        ojtid: type === "ojt" ? Number(id) : 0,
        requiredQuestions: parseInt(documentInfo.totalQuestions),
        createdBy: userEmail || userId.toString(),
        modifiedBy: userEmail || userId.toString(),
        plantID: parseInt(plantId),
        electronicSignature: userName || userData.employeeID,
        signatureDate: currentDate,
        questions: questionsForms.map((q) => ({
          questionID: isEditMode ? q.questionID : 0,
          questionText: q.questionText.trim(),
          isMandatory: q.mandatory,
          marks: parseInt(q.marks) || 0,
          createdBy: userEmail || userId.toString(),
          modifiedBy: userEmail || userId.toString(),
          electronicSignature: userName || userData.employeeID,
          signatureDate: currentDate,
          options: q.options
            .filter((opt) => opt.optionText.trim())
            .map((opt, optIndex) => ({
              optionID: isEditMode ? opt.optionID : 0,
              optionText: opt.optionText.trim(),
              isCorrect: opt.optionText === q.correctAnswer,
              displayOrder: Number(optIndex + 1),
            })),
        })),
      };

      console.log("Sending question data:", questionDataToSend);

      let response;
      if (isEditMode) {
        response = await updateQuestion(questionDataToSend);
      } else {
        response = await createQuestion(questionDataToSend);
      }

      if (isMounted) {
        if (response?.header?.errorCount === 0) {
          const apiMessage =
            response?.header?.messages?.[0]?.messageText ||
            "Questions prepared successfully!";
          toast.success(apiMessage);

          if (!isEditMode) {
            setDocumentInfo({
              linkedDocument: "",
              totalQuestions: 1,
              documentID: 0,
              ojtid: 0,
              type: "",
            });
            setQuestionsForms([
              {
                questionText: "",
                options: [
                  { optionText: "", optionID: 0, isCorrect: false },
                  { optionText: "", optionID: 0, isCorrect: false },
                ],
                correctAnswer: "",
                mandatory: false,
                marks: 0,
                questionID: 0,
              },
            ]);
            setSelectedOptions({});
            loadDocuments();
          }

          setTimeout(() => {
            navigate("/document-management/questioner-preparation");
          }, 1500);
        } else {
          const apiError =
            response?.header?.messages?.[0]?.messageText ||
            "Failed to prepare questions";
          toast.error(apiError);
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error("Error in handleSubmit:", err);
        toast.error(
          err.message ||
            `Failed to ${isEditMode ? "update" : "create"} questions`
        );
        setError(
          err.message ||
            `Failed to ${isEditMode ? "update" : "create"} questions`
        );
        setContextError(
          err.message ||
            `Failed to ${isEditMode ? "update" : "create"} questions`
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const getFilledOptions = (questionIndex) => {
    return questionsForms[questionIndex].options
      .map((opt, idx) => ({ opt: opt.optionText, idx }))
      .filter((o) => o.opt.trim() !== "");
  };

  const handlePreviewOptionSelect = (qIdx, opt) => {
    setSelectedOptions((prev) => ({ ...prev, [qIdx]: opt }));
  };

  return (
    <>
      <div className="main-container">
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="tableWhiteCardContainer">
          {/* Form Section */}

          <form onSubmit={handleSubmit}>
            <h3 className="heading">
              {isEditMode ? "Edit Question Set" : "Create New Question Set"}
            </h3>

            {success && (
              <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}

            {(error || contextError) && (
              <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
                {error || contextError}
              </div>
            )}

            {/* Document and Total Questions Section */}
            {!isEditMode && (
              <>
                <h4 className="sub-heading">
                  Document Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Linked Document */}
                  <CustomAsyncSelect
                    label="Linked Document"
                    value={documentInfo.linkedDocument}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (!selectedValue) {
                        setDocumentInfo({
                          ...documentInfo,
                          linkedDocument: "",
                          type: "",
                          documentID: 0,
                          ojtid: 0,
                        });
                        return;
                      }
                      const [type, id] = selectedValue.split("-");
                      const selectedDoc = documents.find(
                        (doc) =>
                          (type === "doc" && doc.documentID === Number(id)) ||
                          (type === "ojt" && doc.ojtid === Number(id))
                      );
                      if (selectedDoc) {
                        setDocumentInfo({
                          ...documentInfo,
                          linkedDocument: selectedValue,
                          type: type,
                          documentID: type === "doc" ? Number(id) : 0,
                          ojtid: type === "ojt" ? Number(id) : 0,
                        });
                      }
                    }}
                    required
                    disabled={loading || documents.length === 0}
                    options={[
                      { value: "", label: "Select Document" },
                      ...documents
                        .filter((doc) => doc && (doc.documentID || doc.ojtid))
                        .map((doc) => {
                          const value =
                            doc.documentID !== 0
                              ? `doc-${doc.documentID}`
                              : `ojt-${doc.ojtid}`;
                          return {
                            value,
                            label: doc.documentName || "Unnamed Document",
                          };
                        }),
                    ]}
                  />

                  {/* Total Questions Required */}
                  <InputField
                    label="Total Questions required in exam"
                    type="number"
                    min="1"
                    value={documentInfo.totalQuestions}
                    onChange={(e) =>
                      setDocumentInfo({
                        ...documentInfo,
                        totalQuestions: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    required
                  />
                </div>
              </>
            )}

            {/* Question Forms Section */}
            <div className="mb-8">
              <h4 className="sub-heading">
                Question Forms
              </h4>

              {questionsForms.map((q, idx) => (
                <div
                  key={`question-${idx}`}
                  className="border border-gray-200 rounded-lg p-4 mb-6 last:mb-0"
                  ref={
                    idx === questionsForms.length - 1 ? lastQuestionRef : null
                  }
                >
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-lg font-medium text-gray-700">
                      Question {idx + 1}
                    </h5>
                    {questionsForms.length > documentInfo.totalQuestions && (
                      <button
                        type="button"
                        variant="danger"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="btn-remove"
                      >
                        Remove Question
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <EnhancedInputField
                    label="Question Text"
                    value={q.questionText}
                    onChange={(e) =>
                      handleQuestionTextChange(idx, e.target.value)
                    }
                    required
                    className="mb-4"
                    rows={3}
                  />

                  {/* Options Column */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-2 w-full">
                      {q.options.map((opt, oidx) => (
                        <div
                          key={`option-${idx}-${oidx}`}
                          className="flex w-full gap-2"
                        >
                          <div className="flex-grow">
                            <InputField
                              type="text"
                              maxLength={MAX_OPTION_LENGTH}
                              value={opt.optionText}
                              placeholder={`Option ${String.fromCharCode(
                                65 + oidx
                              )}`}
                              onChange={(e) =>
                                handleOptionChange(idx, oidx, e.target.value)
                              }
                              className="w-full"
                            />
                          </div>
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(idx, oidx)}
                              className="btn-remove"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      {q.options.length < 4 && (
                        <button
                          type="button"
                          onClick={() => addOption(idx)}
                          className="btn-add"
                        >
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Settings Column */}
                  <div className="mt-2">
                    <CustomAsyncSelect
                      label="Correct Answer"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        handleCorrectAnswerChange(idx, e.target.value)
                      }
                      required
                      options={[
                        { value: "", label: "Select Correct Option" },
                        ...getFilledOptions(idx).map(
                          ({ opt, idx: optIdx }) => ({
                            value: opt,
                            label: `${String.fromCharCode(
                              65 + optIdx
                            )}. ${opt}`,
                          })
                        ),
                      ]}
                    />

                    <InputField
                      label="Marks"
                      type="number"
                      value={q.marks}
                      onChange={(e) =>
                        handleMarksChange(
                          idx,
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      required
                    />

                    <CheckboxField
                      label="Mandatory Question?"
                      checked={q.mandatory}
                      onChange={(e) =>
                        handleMandatoryChange(idx, e.target.checked)
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="btn-add"
                >
                  Add Question
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate("/document-management/questioner-preparation")
                }
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                variant="primary"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? "Saving..." : isEditMode ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
        {/* Preview Section */}
        <div className="main-container">
            
        {questionsForms.length > 0 && (
          <div className="tableWhiteCardContainer">
          
              <h3 className="heading">
                Question Paper Preview
              </h3>
              <div className="space-y-4">
                {questionsForms.map((q, idx) => (
                  <div
                    key={`preview-${idx}`}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                      {idx + 1}. {q.questionText}
                    </h4>
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, oidx) => (
                        <label
                          key={oidx}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question_${idx}_preview`}
                            value={opt.optionText}
                            checked={q.correctAnswer === opt.optionText}
                            disabled
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>
                            {String.fromCharCode(65 + oidx)}. {opt.optionText}
                          </span>
                        </label>
                      ))}
                    </div>
                    {q.correctAnswer && (
                      <p className="text-sm font-medium text-teal-600">
                        Correct Answer:{" "}
                        {String.fromCharCode(
                          65 +
                            q.options.findIndex(
                              (o) => o.optionText === q.correctAnswer
                            )
                        )}
                        . {q.correctAnswer}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Marks: {q.marks} | Mandatory: {q.mandatory ? "Yes" : "No"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
         
        )}
      </div>
      </div>
    </>
  );
};

export default QuestionPrepare;
