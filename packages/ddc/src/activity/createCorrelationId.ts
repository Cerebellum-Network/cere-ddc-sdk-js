import { v4 as uuid } from 'uuid';

/**
 * Generate a random correlation ID.
 */
export const createCorrelationId = () => uuid();
