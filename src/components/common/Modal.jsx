const Modal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl text-center text-gray-800">
        <h2 className="text-xl font-semibold text-[#127C96] mb-4">{title}</h2>

        <div className="mb-5">
          {typeof message === 'string' ? (
            <p className="text-base leading-relaxed">{message}</p>
          ) : (
            message
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="min-w-[120px] px-4 py-2 rounded-lg bg-[#127C96] text-white font-medium hover:bg-[#0f6a83] transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="min-w-[120px] px-4 py-2 rounded-lg bg-gray-300 text-black font-medium hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
