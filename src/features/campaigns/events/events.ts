import type { CampaignContext } from "@/features/campaigns";
import { CampaignResource, requireResource } from "@/features/campaigns/base/resource";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const createEventSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  isPrivate: z.boolean().optional(),
  calendarId: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  calendarId: z.string().optional(),
  date: z.string().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsSchema>;

export const EventSchemas = {
  create: createEventSchema,
  update: updateEventSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const eventInclude = {
  users: { select: { id: true, name: true, email: true } },
  calendars: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.eventsInclude;

class Events extends CampaignResource {
  constructor() {
    super("events", eventInclude);
  }

  async list(campaignId: string, query: ListEventsQuery) {
    const { type, isPrivate, calendarId, date, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (calendarId) where.calendarId = calendarId;
    if (date) where.date = date;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { events: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const event = await this.get(id, ctx.campaign.id);
    return { event: await requireResource(event) };
  }

  async createOne(ctx: CampaignContext, data: CreateEvent) {
    const event = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { event };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateEvent) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const event = await this.update(id, ctx.campaign.id, data);
    return { event };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }

  async getByCalendarDateRange(
    campaignId: string,
    calendarId: string,
    startDate: string,
    endDate: string
  ) {
    return this.db.findMany({
      where: {
        campaignId,
        calendarId,
        date: { gte: startDate, lte: endDate },
      },
      include: this.include,
      orderBy: { date: "asc" },
    });
  }
}

export const events = new Events();
export const eventService = events;
export const listEventsQuerySchema = listEventsSchema;
