/**
 * LEX FORENSICA — TrainingPool Service
 * Handles POST /api/v1/training-pool/sync
 *
 * JWT verification via AsyncLocalStorage context mapping:
 * - Auth identity is stored per-request in AsyncLocalStorage
 * - No global state, thread-safe for concurrent async operations
 * - getStore() retrieves identity without threading req object through call stack
 */

import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '../lib/auth/jwt';
import { sanitizePayload, stripPII } from '../lib/pii/piiStripper';
import type {
  ForensicAuditPayloadDTO,
  RLHFSyncResponseDTO,
} from '../lib/dto/forensicAuditPayload.dto';

const prisma = new PrismaClient();

// AsyncLocalStorage: JWT identity mapped per request — no global auth state
export const authContext = new AsyncLocalStorage<{ uid: string; role: string }>();

// ─── JWT MIDDLEWARE ───────────────────────────────────────────────────────────
// Compatible with Express / Hono / Fastify

export async function jwtContextMiddleware(
  req: any,
  res: any,
  next: () => void
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token);
    // Run the rest of the request lifecycle inside the AsyncLocalStorage context
    authContext.run({ uid: decoded.uid, role: decoded.role }, next);
  } catch {
    return res.status(401).json({ error: 'JWT verification failed' });
  }
}

// ─── RLHF SYNC HANDLER ───────────────────────────────────────────────────────

export async function syncToTrainingPool(
  payload: ForensicAuditPayloadDTO
): Promise<RLHFSyncResponseDTO> {

  // 1. Auth context from AsyncLocalStorage — no req object needed downstream
  const ctx = authContext.getStore();
  if (!ctx) throw new Error('AUTH_CONTEXT_MISSING: Request executed outside auth boundary');

  // 2. Zero-knowledge PII check — sanitize entire node payload before persistence
  const sanitizedNode = sanitizePayload(payload.node as Record<string, any>);
  const piiCheck = stripPII(JSON.stringify(sanitizedNode));

  // 3. Validate parent AnalyticalNode exists
  const parentNode = await prisma.analyticalNode.findUnique({
    where: { id: payload.analyticalNodeId },
  });
  if (!parentNode) {
    return {
      status: 'REJECTED',
      piiCheckPassed: piiCheck.clean,
      message: `AnalyticalNode ${payload.analyticalNodeId} not found`,
    };
  }

  // 4. Write structured node + TrainingPoolEntry based on nodeType
  let trainingEntry;

  if (payload.nodeType === 'SEMANTIC_BRIDGE') {
    const nodeData = sanitizedNode as any;

    const sbNode = await prisma.semanticBridgeNode.create({
      data: {
        sourceTerm: nodeData.sourceTerm,
        distortedTerm: nodeData.distortedTerm,
        context: nodeData.context,
        distortionType: nodeData.distortionType,
        validatedStatus: 'HUMAN_VALIDATED',
        analyticalNodeId: payload.analyticalNodeId,
      },
    });

    trainingEntry = await prisma.trainingPoolEntry.create({
      data: {
        nodeType: 'SEMANTIC_BRIDGE',
        validatedPayload: sanitizedNode,
        humanLabel: payload.humanLabel,
        analyticalNodeId: payload.analyticalNodeId,
        semanticBridgeNodeId: sbNode.id,
        status: 'TRAINING_POOL',
      },
    });

  } else if (payload.nodeType === 'CAUSAL_CHRONOMETER') {
    const nodeData = sanitizedNode as any;

    const ccNode = await prisma.causalChronometerNode.create({
      data: {
        gapDuration: nodeData.gapDuration,
        anomalyType: nodeData.anomalyType,
        context: nodeData.context,
        validatedStatus: 'HUMAN_VALIDATED',
        analyticalNodeId: payload.analyticalNodeId,
      },
    });

    trainingEntry = await prisma.trainingPoolEntry.create({
      data: {
        nodeType: 'CAUSAL_CHRONOMETER',
        validatedPayload: sanitizedNode,
        humanLabel: payload.humanLabel,
        analyticalNodeId: payload.analyticalNodeId,
        causalChronometerNodeId: ccNode.id,
        status: 'TRAINING_POOL',
      },
    });
  }

  return {
    status: 'QUEUED',
    trainingPoolEntryId: trainingEntry?.id,
    piiCheckPassed: piiCheck.clean,
    message: `Node ${payload.nodeType} queued for training pool. Operator: ${ctx.uid}`,
  };
}
