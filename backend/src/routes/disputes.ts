import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DisputeService from '../services/DisputeService';
import { DisputeStatus, DisputeType, DisputeSeverity } from '@prisma/client';

const router = express.Router();

/**
 * Validation middleware
 */
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/disputes/create
 * Create a new dispute
 */
router.post(
  '/create',
  [
    body('reporterId').isString().notEmpty(),
    body('reportedId').isString().notEmpty(),
    body('type').isIn(Object.values(DisputeType)),
    body('severity').isIn(Object.values(DisputeSeverity)),
    body('subject').isString().notEmpty().isLength({ max: 200 }),
    body('description').isString().notEmpty().isLength({ max: 2000 }),
    body('orderId').optional().isString(),
    body('reputationCardId').optional().isString(),
    body('productId').optional().isString(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.createDispute(req.body);
      res.status(201).json(dispute);
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * GET /api/disputes/:disputeId
 * Get dispute details
 */
router.get(
  '/:disputeId',
  [param('disputeId').isUUID()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.getDisputeById(req.params.disputeId);
      
      if (!dispute) {
        return res.status(404).json({ error: 'Dispute not found' });
      }

      res.json(dispute);
    } catch (error: any) {
      console.error('Error fetching dispute:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/disputes
 * Get all disputes with filters
 */
router.get(
  '/',
  [
    query('status').optional().isIn(Object.values(DisputeStatus)),
    query('type').optional().isIn(Object.values(DisputeType)),
    query('severity').optional().isIn(Object.values(DisputeSeverity)),
    query('assignedTo').optional().isString(),
    query('reporterId').optional().isString(),
    query('reportedId').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as DisputeStatus | undefined,
        type: req.query.type as DisputeType | undefined,
        severity: req.query.severity as DisputeSeverity | undefined,
        assignedTo: req.query.assignedTo as string | undefined,
        reporterId: req.query.reporterId as string | undefined,
        reportedId: req.query.reportedId as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const result = await DisputeService.getDisputes(filters);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching disputes:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/disputes/moderator/:moderatorId
 * Get disputes assigned to a moderator
 */
router.get(
  '/moderator/:moderatorId',
  [
    param('moderatorId').isString().notEmpty(),
    query('status').optional().isIn(Object.values(DisputeStatus)),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const disputes = await DisputeService.getModeratorDisputes(
        req.params.moderatorId,
        req.query.status as DisputeStatus | undefined
      );

      res.json(disputes);
    } catch (error: any) {
      console.error('Error fetching moderator disputes:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/assign
 * Assign dispute to moderator
 */
router.post(
  '/:disputeId/assign',
  [
    param('disputeId').isUUID(),
    body('moderatorId').isString().notEmpty(),
    body('assignedBy').isString().notEmpty(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.assignDispute({
        disputeId: req.params.disputeId,
        moderatorId: req.body.moderatorId,
        assignedBy: req.body.assignedBy,
      });

      res.json(dispute);
    } catch (error: any) {
      console.error('Error assigning dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/evidence
 * Add evidence to dispute
 */
router.post(
  '/:disputeId/evidence',
  [
    param('disputeId').isUUID(),
    body('uploadedBy').isString().notEmpty(),
    body('type').isString().notEmpty(),
    body('url').isURL(),
    body('description').optional().isString().isLength({ max: 500 }),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const evidence = await DisputeService.addEvidence(
        req.params.disputeId,
        req.body.uploadedBy,
        req.body.type,
        req.body.url,
        req.body.description,
        req.body.metadata
      );

      res.status(201).json(evidence);
    } catch (error: any) {
      console.error('Error adding evidence:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/comment
 * Add comment to dispute
 */
router.post(
  '/:disputeId/comment',
  [
    param('disputeId').isUUID(),
    body('authorId').isString().notEmpty(),
    body('content').isString().notEmpty().isLength({ max: 1000 }),
    body('isInternal').optional().isBoolean(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const comment = await DisputeService.addComment(
        req.params.disputeId,
        req.body.authorId,
        req.body.content,
        req.body.isInternal || false
      );

      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/escalate
 * Escalate dispute to higher level
 */
router.post(
  '/:disputeId/escalate',
  [
    param('disputeId').isUUID(),
    body('escalatedBy').isString().notEmpty(),
    body('reason').isString().notEmpty().isLength({ max: 500 }),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.escalateDispute(
        req.params.disputeId,
        req.body.escalatedBy,
        req.body.reason
      );

      res.json(dispute);
    } catch (error: any) {
      console.error('Error escalating dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/resolve
 * Resolve dispute
 */
router.post(
  '/:disputeId/resolve',
  [
    param('disputeId').isUUID(),
    body('moderatorId').isString().notEmpty(),
    body('resolution').isString().notEmpty().isLength({ max: 1000 }),
    body('resolutionType').isString().notEmpty(),
    body('resolutionNotes').optional().isString().isLength({ max: 2000 }),
    body('txSignature').optional().isString(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.resolveDispute({
        disputeId: req.params.disputeId,
        moderatorId: req.body.moderatorId,
        resolution: req.body.resolution,
        resolutionType: req.body.resolutionType,
        resolutionNotes: req.body.resolutionNotes,
        txSignature: req.body.txSignature,
      });

      res.json(dispute);
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/vote
 * Vote on dispute (for complex cases)
 */
router.post(
  '/:disputeId/vote',
  [
    param('disputeId').isUUID(),
    body('voterId').isString().notEmpty(),
    body('approved').isBoolean(),
    body('reasoning').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const vote = await DisputeService.voteOnDispute(
        req.params.disputeId,
        req.body.voterId,
        req.body.approved,
        req.body.reasoning
      );

      res.status(201).json(vote);
    } catch (error: any) {
      console.error('Error voting on dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/close
 * Close dispute
 */
router.post(
  '/:disputeId/close',
  [
    param('disputeId').isUUID(),
    body('closedBy').isString().notEmpty(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const dispute = await DisputeService.closeDispute(
        req.params.disputeId,
        req.body.closedBy
      );

      res.json(dispute);
    } catch (error: any) {
      console.error('Error closing dispute:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * GET /api/disputes/statistics
 * Get dispute statistics
 */
router.get(
  '/stats/overview',
  [query('period').optional().isString()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const stats = await DisputeService.getDisputeStatistics(
        req.query.period as string | undefined
      );

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching dispute statistics:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
