import type { CampaignContext } from "@/features/campaigns";
import { CampaignResourceRepository } from "@/features/campaigns/base/CampaignResourceRepository";
import { CampaignResourceService } from "@/features/campaigns/base/CampaignResourceService";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

// In-file Zod schema for events based on Prisma model
const eventsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  isPrivate: z.boolean().optional(),
  calendarId: z.string().optional(),
});

const eventsPartialSchema = eventsOptionalDefaultsSchema.partial();

export const EventSchemas = makeNamedResourceSchemas({
  optionalDefaults: eventsOptionalDefaultsSchema,
  partial: eventsPartialSchema,
});

export const listEventsQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  calendarId: z.string().optional(),
  date: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof EventSchemas.create>;
export type UpdateEventInput = z.infer<typeof EventSchemas.update>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

const eventInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  calendars: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.eventsInclude;

class EventRepository extends CampaignResourceRepository<
  any,
  typeof eventInclude,
  CreateEventInput,
  UpdateEventInput,
  ListEventsQuery
> {
  constructor() {
    super("events" as Prisma.ModelName, eventInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListEventsQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    if (query.calendarId) filters.calendarId = query.calendarId;
    if (query.date) filters.date = query.date;
    return filters;
  }

  async findMany(campaignId: string, query: ListEventsQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }

  /**
   * Find events by calendar and date range
   */
  async findByCalendarAndDateRange(
    campaignId: string,
    calendarId: string,
    startDate: string,
    endDate: string
  ) {
    return this.model.findMany({
      where: {
        campaignId,
        calendarId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: this.include,
      orderBy: { date: "asc" },
    });
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class EventService extends CampaignResourceService<
  any,
  EventRepository,
  CreateEventInput,
  UpdateEventInput,
  ListEventsQuery
> {
  constructor() {
    super(new EventRepository(), "event");
  }

  protected get pluralResourceName(): string {
    return "events";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateEventInput
  ): Promise<void> {
    // Validate calendar exists in campaign if calendarId provided
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateEventInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Add custom validation if needed
  }

  /**
   * Get events in a date range for a calendar
   */
  async getEventsByCalendarDateRange(
    ctx: CampaignContext,
    calendarId: string,
    startDate: string,
    endDate: string
  ) {
    const events = await (
      this.repository as EventRepository
    ).findByCalendarAndDateRange(
      ctx.campaign.id,
      calendarId,
      startDate,
      endDate
    );
    return { events };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const eventRepo = new EventRepository();
export const eventService = new EventService();
export { eventRepo };
