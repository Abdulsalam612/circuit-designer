import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase';

// Feedback / bug reports, stored in the top-level `feedback` collection. Anyone can add one
// (signed in or not); nobody can read them from the site – the owner reads them in the
// Firebase console. firestore.rules checks the same fields and limits as below, so keep
// the two in step.

export const FEEDBACK_TYPES = ['bug', 'idea', 'question', 'other'] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_EMAIL_LENGTH = 200;
const MAX_PAGE_LENGTH = 200;
const MAX_USER_AGENT_LENGTH = 400;

export const isFeedbackType = (value: string | null): value is FeedbackType =>
  FEEDBACK_TYPES.includes(value as FeedbackType);

export interface FeedbackInput {
  type: FeedbackType;
  message: string;
  email?: string;
  uid?: string;
  // Where the problem happened, e.g. "/simulation" (bug reports)
  page?: string;
  userAgent?: string;
}

export const submitFeedback = (input: FeedbackInput) => {
  // Firestore rejects undefined, and the rules only allow known fields, so leave out empties
  const data: Record<string, unknown> = {
    type: input.type,
    message: input.message.trim().slice(0, MAX_MESSAGE_LENGTH),
    createdAt: serverTimestamp(),
  };
  const email = input.email?.trim();
  if (email) data.email = email.slice(0, MAX_EMAIL_LENGTH);
  if (input.uid) data.uid = input.uid;
  if (input.page) data.page = input.page.slice(0, MAX_PAGE_LENGTH);
  if (input.userAgent) data.userAgent = input.userAgent.slice(0, MAX_USER_AGENT_LENGTH);
  return addDoc(collection(firestore, 'feedback'), data);
};
