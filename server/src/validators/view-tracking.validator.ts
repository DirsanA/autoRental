import { z } from "zod";
import { ENTITY_TYPES } from "../models/AdminViewTracking.js";

/**
 * Valid entity types for view tracking
 */
const entityTypeSchema = z.enum(ENTITY_TYPES);

/**
 * Schema for marking a single entity as viewed
 */
export const markAsViewedSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1, "Entity ID is required"),
});

/**
 * Schema for marking multiple entities as viewed (page view)
 */
export const markPageAsViewedSchema = z.object({
  entityType: entityTypeSchema,
  entityIds: z.array(z.string().min(1)).min(1).max(100), // Limit to 100 per request
});

/**
 * Schema for getting unviewed counts
 */
export const getUnviewedCountsSchema = z.object({
  entityType: entityTypeSchema.optional(),
});

/**
 * Schema for getting unviewed IDs
 */
export const getUnviewedIdsSchema = z.object({
  entityType: entityTypeSchema,
  entityIds: z.array(z.string()).optional(), // If not provided, returns all action-required IDs
});

/**
 * Schema for marking action taken
 */
export const markActionTakenSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1),
});

// Type exports
export type MarkAsViewedInput = z.infer<typeof markAsViewedSchema>;
export type MarkPageAsViewedInput = z.infer<typeof markPageAsViewedSchema>;
export type GetUnviewedCountsInput = z.infer<typeof getUnviewedCountsSchema>;
export type GetUnviewedIdsInput = z.infer<typeof getUnviewedIdsSchema>;
export type MarkActionTakenInput = z.infer<typeof markActionTakenSchema>;
