/**
 * Security Module - Exportações centralizadas
 * Todas as funções de segurança em um só lugar
 */

// Rate Limiting
export {
  createRateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  transcriptionRateLimiter,
  imageUploadRateLimiter,
  transactionCreationRateLimiter,
} from './rate-limiter';

// Sanitization & Validation
export {
  sanitize,
  validate,
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  sanitizeAmount,
  sanitizeDate,
  sanitizeSQL,
  sanitizeFilename,
  isValidUUID,
  isValidTransactionType,
  isValidWorkspaceType,
  isValidBase64,
} from './sanitize';

// Audit Logs
export {
  logAudit,
  logFailedLogin,
  isIPBlocked,
  getIPFromRequest,
  getUserAgentFromRequest,
  cleanupOldLogs,
  getUserAuditLogs,
} from './audit';

export type { AuditAction, ResourceType, AuditLogData } from './audit';

