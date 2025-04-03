export type DocumentType = 'passport' | 'dni' | 'other';
export type SubmissionStatus = 'pending' | 'submitted' | 'error';

export interface SESSubmission {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  documentType: DocumentType;
  documentNumber: string;
  submissionDate: string;
  status: SubmissionStatus;
  errorMessage?: string;
} 