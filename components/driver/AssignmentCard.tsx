import React, { ChangeEvent } from 'react';
import './AssignmentCard.css';

interface Assignment {
  id: number;
  orderId: number;
  customerName: string;
  address: string;
  status: string;
  trackingNumber?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onAccept: () => void;
  onReject: () => void;
  onStatusChange: (newStatus: string) => void;
  onProofUpload: (files: FileList) => void;
}

const statusOptions = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onAccept,
  onReject,
  onStatusChange,
  onProofUpload,
}) => {
  const handleStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onProofUpload(e.target.files);
    }
  };

  return (
    <div className="assignment-card card">
      <h3 className="customer-name">{assignment.customerName}</h3>
      <p className="address">{assignment.address}</p>
      <p className="status">
        <strong>Status:</strong>{' '}
        <select
          value={assignment.status}
          onChange={handleStatus}
          className="status-select"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </p>
      {assignment.trackingNumber && (
        <p className="tracking">
          <strong>Tracking #:</strong> {assignment.trackingNumber}
        </p>
      )}
      <div className="actions">
        <button className="btn accept" onClick={onAccept}>
          Accept
        </button>
        <button className="btn reject" onClick={onReject}>
          Reject
        </button>
      </div>
      <div className="upload">
        <label className="upload-label">
          Upload Proof
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
      </div>
    </div>
  );
};

export default AssignmentCard;
