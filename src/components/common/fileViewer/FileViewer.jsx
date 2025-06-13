import React, { useState, useRef, useEffect } from 'react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downloadFileById, FetchStreamToken } from '../../../services/DownloadService';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import Spinner from "../../common/Spinner";
const FileViewer = ({ id, type, extension, onClose }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const cleanup = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setContentType(null);
    setShowModal(false);
    setLoading(false);
  };

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        setContentType(extension);
        if (extension === '.pdf') {
          const response = await downloadFileById(type, id);
          const url = URL.createObjectURL(response.data);
          setFileUrl(url);
        } else if (extension === '.mp4') {
          const token = await FetchStreamToken(type, id);
          setFileUrl(`${import.meta.env.VITE_API_BASE_URL}download/stream/${token}`);
        }
        setShowModal(true);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download the document. Please check the ID.');
        cleanup();
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
    return () => cleanup();
  }, [id]);

  const handleCloseModal = () => {
    cleanup();
    onClose();
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-white text-lg"> <Spinner/></div>;
    }

    switch (contentType) {
      case '.pdf':
        return fileUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        ) : null;
      case '.mp4':
        return fileUrl ? (
          <video
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : null;
      default:
        return (
          <div className="text-white text-lg p-6">
            Unsupported file type: <strong>{contentType}</strong>
          </div>
        );
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed top-0 left-0 z-[9999] w-screen h-screen bg-black bg-opacity-80 flex justify-center items-center">
          <div
            ref={containerRef}
            className={`relative w-[90%] h-[90%] rounded-lg overflow-hidden shadow-2xl flex justify-center items-center ${
              contentType === '.pdf' ? 'bg-white' : 'bg-black'
            }`}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-red-600 text-white px-4 py-2 rounded-md z-50 hover:bg-red-700"
            >
              Close
            </button>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default FileViewer;
