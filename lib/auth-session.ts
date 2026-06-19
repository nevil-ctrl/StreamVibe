import { cache } from 'react';
import { auth } from '@/auth';

/** Deduplicates auth() calls within a single server request. */
export const getServerSession = cache(auth);
