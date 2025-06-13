import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateQuestion } from "../../../services/sopojt-Management/QuestionPrepareService";
import { QuestionPrepareContext } from "../../../context/sopOjt-Management/QuestionPrepareContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
import {
  InputField,
  EnhancedInputField,
  CustomAsyncSelect,
  CheckboxField,
} from "../../../components/common/ui/FormFields";
import Spinner from '../../../components/common/Spinner';
const MAX_QUESTION_LENGTH = 200;
const MAX_OPTION_LENGTH = 100;

const EditQuestionPrepare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    editModeData,
    loading: contextLoading,
    error: contextError,
    loadQuestionForEdit,
    clearEditModeData,
  } = useContext(QuestionPrepareContext);

  const [loading, setLoading] = useState(false);
  const [questionsForms, setQuestionsForms] = useState([]);
  const [documentInfo, setDocumentInfo] = useState({
    linkedDocument: "",
    totalQuestions: "1", // Ensure this is a string initially
    preparationID: null,
  });
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");
  const initialFormRef = useRef(null);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState([]);
  const lastQuestionRef = useRef(null);

  // Helper function to safely map question data
  const mapQuestionData = (questions) => {
    if (!Array.isArray(questions)) return [];
    return questions.map((q) => ({
      ...q,
      questionText: String(q.questionText || ""),
      marks: Number(q.marks) || 0,
      options: Array.isArray(q.options)
        ? q.options.map((opt) => ({
            ...opt,
            optionText: String(opt.optionText || ""),
            optionID: Number(opt.optionID) || 0,
          }))
        : [],
    }));
  };

  // Load question data when component mounts or id changes
  useEffect(() => {
    if (id) {
      loadQuestionForEdit(id);
    }
  }, [id, loadQuestionForEdit]);

  // Update local state when editModeData changes
  useEffect(() => {
    if (
      editModeData &&
      editModeData.documentID !== undefined &&
      editModeData.requiredQuestions !== undefined
    ) {
      const safeEditModeData = {
        ...editModeData,
        documentID: String(editModeData.documentID || ""),
        requiredQuestions: String(editModeData.requiredQuestions || "1"),
        preparationID: editModeData.preparationID
          ? String(editModeData.preparationID)
          : null,
        questions: mapQuestionData(editModeData.questions || []),
      };

      setDocumentInfo({
        linkedDocument: safeEditModeData.documentID,
        totalQuestions: safeEditModeData.requiredQuestions,
        preparationID: safeEditModeData.preparationID,
      });

      setQuestionsForms(safeEditModeData.questions);

      initialFormRef.current = JSON.stringify({
        documentInfo: {
          linkedDocument: safeEditModeData.documentID,
          totalQuestions: safeEditModeData.requiredQuestions,
          preparationID: safeEditModeData.preparationID,
        },
        questionsForms: safeEditModeData.questions,
      });
    }
  }, [editModeData, contextLoading, contextError, id]);

  // Scroll to last question when added
  useEffect(() => {
    if (questionsForms.length > 1 && lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [questionsForms.length]);

  // Safe value handlers
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestionsForms((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex) return q;
        const newOptions = q.options.map((opt, oidx) =>
          oidx === optionIndex
            ? { ...opt, optionText: String(value || "") }
            : opt
        );
        return { ...q, options: newOptions };
      })
    );
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
    const optionToRemove = updatedQuestions[questionIndex].options[optionIndex];

    if (updatedQuestions[questionIndex].options.length > 2) {
      if (optionToRemove.optionID && optionToRemove.optionID > 0) {
        setDeletedOptionIds((prev) => [...prev, optionToRemove.optionID]);
      }

      const options = updatedQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );

      if (
        updatedQuestions[questionIndex].correctAnswer ===
        optionToRemove.optionText
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
    setQuestionsForms((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, questionText: String(value || "") } : q
      )
    );
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    setQuestionsForms((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, correctAnswer: String(value || "") } : q
      )
    );
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

    setQuestionsForms((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, mandatory: Boolean(checked) } : q
      )
    );
  };

  const handleMarksChange = (questionIndex, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setQuestionsForms((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, marks: Number(numericValue) || 0 } : q
      )
    );
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
    if (questionsForms.length <= parseInt(documentInfo.totalQuestions) || 0) {
      toast.warning(
        `Cannot remove questions. Minimum ${documentInfo.totalQuestions} questions required.`
      );
      return;
    }

    const questionToRemove = questionsForms[questionIndex];
    if (questionToRemove.questionID && questionToRemove.questionID > 0) {
      setDeletedQuestionIds((prev) => [...prev, questionToRemove.questionID]);
    }

    const updatedQuestions = questionsForms.filter(
      (_, index) => index !== questionIndex
    );
    setQuestionsForms(updatedQuestions);
  };

  // Sync questions with required count
  useEffect(() => {
    const requiredQuestions = parseInt(documentInfo.totalQuestions) || 0;
    const currentQuestionsCount = questionsForms.length;

    if (requiredQuestions > 0 && currentQuestionsCount < requiredQuestions) {
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
  }, [documentInfo.totalQuestions]);

  const isFormChanged = () => {
    if (!initialFormRef.current) return false;
    return (
      JSON.stringify({ documentInfo, questionsForms }) !==
      initialFormRef.current
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormChanged()) {
      toast.info("No changes made to update.");
      return;
    }
    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error("Reason for change is required.");
      return;
    }

    try {
      setLoading(true);

      // Validation
      for (const question of questionsForms) {
        if (!question.questionText.trim()) {
          throw new Error("Please enter text for all questions.");
        }
        if (question.marks <= 0) {
          throw new Error("Please enter valid marks for all questions.");
        }
        if (
          question.options.filter((opt) => opt.optionText.trim()).length < 2
        ) {
          throw new Error(
            "Please provide at least 2 options for all questions."
          );
        }
        if (!question.correctAnswer) {
          throw new Error("Please select a correct answer for all questions.");
        }
        const optionTexts = question.options
          .filter((opt) => opt.optionText.trim())
          .map((opt) => opt.optionText.trim().toLowerCase());
        if (new Set(optionTexts).size !== optionTexts.length) {
          throw new Error("Options cannot be the same within a question.");
        }
      }

      // Get user info safely
      const userDataStr = sessionStorage.getItem("userData") || "{}";
      const plantId = sessionStorage.getItem("plantId") || "0";
      const userId = sessionStorage.getItem("userId") || "0";

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch {
        userData = {};
      }

      if (!editModeData?.preparationID) {
        throw new Error("Preparation ID is missing.");
      }

      const currentDate = new Date().toISOString();
      const userEmail = userData.emailID || userData.loginID || userId;
      const userName =
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        userData.employeeID ||
        "System User";

      const questionDataToSend = {
        preparationID: String(editModeData.preparationID),
        documentID: String(editModeData.documentID || ""),
        requiredQuestions: parseInt(documentInfo.totalQuestions) || 0,
        modifiedBy: String(userEmail),
        plantID: parseInt(plantId) || 0,
        electronicSignature: String(userName),
        signatureDate: currentDate,
        reasonForChange: String(reasonForChange),
        deletedQuestionIDs: deletedQuestionIds.map((id) => Number(id) || 0),
        deletedOptionIDs: deletedOptionIds.map((id) => Number(id) || 0),
        questions: questionsForms.map((q) => ({
          questionID: q.questionID ? Number(q.questionID) : 0,
          questionText: String(q.questionText).trim(),
          isMandatory: Boolean(q.mandatory),
          marks: Number(q.marks) || 0,
          modifiedBy: String(userEmail),
          electronicSignature: String(userName),
          signatureDate: currentDate,
          options: q.options
            .filter((opt) => opt.optionText.trim())
            .map((opt, optIndex) => ({
              optionID: opt.optionID ? Number(opt.optionID) : 0,
              optionText: String(opt.optionText).trim(),
              isCorrect: Boolean(opt.optionText === q.correctAnswer),
              displayOrder: Number(optIndex + 1),
            })),
        })),
      };

      const response = await updateQuestion(questionDataToSend);
      if (response?.header?.errorCount === 0) {
        toast.success(
          response?.header?.messages?.[0]?.messageText ||
            "Question updated successfully",
          {
            onClose: () => {
              clearEditModeData();
              navigate("/document-management/questioner-preparation");
            },
          }
        );
      } else {
        throw new Error(
          response?.header?.messages?.[0]?.messageText ||
            "Failed to update questions"
        );
      }
    } catch (error) {
      toast.error(String(error.message || "Failed to update questions"));
    } finally {
      setLoading(false);
      setShowReasonModal(false);
      setReasonForChange("");
    }
  };

  const getFilledOptions = (questionIndex) => {
    if (!questionsForms[questionIndex]?.options) return [];
    return questionsForms[questionIndex].options
      .map((opt, idx) => ({ opt: String(opt.optionText || ""), idx }))
      .filter((o) => o.opt.trim() !== "");
  };

  if (
    contextLoading ||
    !editModeData ||
    editModeData.documentID === undefined ||
    editModeData.requiredQuestions === undefined
  ) {
    return (
      <div className="spinner-position-addpages">
        <Spinner />
      </div>
    );
  }

  if (contextError) {
    return <div className="text-red-500 p-4">{String(contextError)}</div>;
  }

  return (
    <div className="main-container">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div className="relative">
              {loading && (
                <div className="spinner-position-addpages">
                  <Spinner />
                </div>
              )}
              <div className="space-y-4">
                <p>
                  Please provide a reason for updating the questions for
                  document "{String(editModeData?.documentName || "")}"
                </p>
                <EnhancedInputField
                  value={reasonForChange}
                  onChange={(e) =>
                    setReasonForChange(String(e.target.value || ""))
                  }
                  placeholder="Please provide a reason for this change..."
                  required
                  rows={4}
                />
              </div>
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowReasonModal(false)}
          confirmText="Submit Update"
          cancelText="Cancel"
        />
      )}

      <div className="tableWhiteCardContainer">
        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <h3 className="heading">Edit Question Set</h3>

          {/* Document Details Section */}
          <h4 className="sub-heading">Document Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Linked Document - Display Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Document <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
                {String(editModeData?.documentName || "Document")}
              </div>
            </div>

            {/* Total Questions Required */}
            <InputField
              label="Total Questions required in exam"
              type="text"
              value={String(documentInfo.totalQuestions || "")}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setDocumentInfo((info) => ({
                  ...info,
                  totalQuestions: val || "1",
                }));
              }}
              required
            />
          </div>

          {/* Question Forms Section */}
          <div className="mb-8">
            <h4 className="sub-heading">Question Forms</h4>

            {questionsForms.map((q, idx) => (
              <div
                key={`question-${idx}`}
                className="border border-gray-200 rounded-lg p-4 mb-6 last:mb-0"
                ref={idx === questionsForms.length - 1 ? lastQuestionRef : null}
              >
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-medium text-gray-700">
                    Question {idx + 1}
                  </h5>
                  {questionsForms.length >
                    (parseInt(documentInfo.totalQuestions) || 0) && (
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
                  value={String(q.questionText || "")}
                  onChange={(e) =>
                    handleQuestionTextChange(idx, e.target.value)
                  }
                  required
                  className="mb-4"
                  rows={3}
                />

                <div className="w-full">
                  {/* Options Column */}
                  <div>
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
                              value={String(opt.optionText || "")}
                              placeholder={`Option ${String.fromCharCode(
                                65 + oidx
                              )}`}
                              onChange={(e) =>
                                handleOptionChange(idx, oidx, e.target.value)
                              }
                              className="flex-1 mb-0"
                            />
                          </div>
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              variant="danger"
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
                          variant="outline"
                          onClick={() => addOption(idx)}
                          className="btn-add"
                        >
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Settings Column */}
                  <div>
                    <CustomAsyncSelect
                      label="Correct Answer"
                      value={
                        q.correctAnswer
                          ? {
                              value: String(q.correctAnswer),
                              label: `${String.fromCharCode(
                                65 +
                                  getFilledOptions(idx).findIndex(
                                    (opt) => opt.opt === q.correctAnswer
                                  )
                              )}. ${q.correctAnswer}`,
                            }
                          : { value: "", label: "Select Correct Option" }
                      }
                      onChange={(selectedOption) =>
                        handleCorrectAnswerChange(
                          idx,
                          selectedOption?.value || ""
                        )
                      }
                      required
                      options={[
                        { value: "", label: "Select Correct Option" },
                        ...getFilledOptions(idx).map(
                          ({ opt, idx: optIdx }) => ({
                            value: String(opt),
                            label: `${String.fromCharCode(
                              65 + optIdx
                            )}. ${String(opt)}`,
                          })
                        ),
                      ]}
                    />

                    <InputField
                      label="Marks"
                      type="number"
                      value={String(q.marks || "0")}
                      onChange={(e) => handleMarksChange(idx, e.target.value)}
                      required
                    />

                    <CheckboxField
                      label="Mandatory Question?"
                      checked={Boolean(q.mandatory)}
                      onChange={(e) =>
                        handleMandatoryChange(idx, e.target.checked)
                      }
                    />
                  </div>
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
              onClick={() => {
                clearEditModeData();
                navigate("/document-management/questioner-preparation");
              }}
              disabled={loading || contextLoading}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              variant="primary"
              disabled={loading || contextLoading || !isFormChanged()}
              className="btn-submit"
            >
              {loading || contextLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
      <div className="main-container">
        <div className="tableWhiteCardContainer">
          {/* Preview Section */}
          {questionsForms.length > 0 && (
            <div>
              <h3 className="sub-heading">Question Paper Preview</h3>
              <div className="space-y-4">
                {questionsForms.map((q, idx) => (
                  <div
                    key={`preview-${idx}`}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                      {idx + 1}. {String(q.questionText || "")}
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
                            value={String(opt.optionText || "")}
                            checked={
                              String(q.correctAnswer || "") ===
                              String(opt.optionText || "")
                            }
                            disabled
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>
                            {String.fromCharCode(65 + oidx)}.{" "}
                            {String(opt.optionText || "")}
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
                              (o) =>
                                String(o.optionText || "") ===
                                String(q.correctAnswer || "")
                            )
                        )}
                        . {String(q.correctAnswer || "")}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Marks: {Number(q.marks) || 0} | Mandatory:{" "}
                      {q.mandatory ? "Yes" : "No"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuestionPrepare;
