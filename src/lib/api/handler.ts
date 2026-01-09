import { authConfig } from "@/lib/auth";
import { ResourceOperations } from "@/lib/data/resources/operations";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

/**
 * API handler configuration
 */
export interface ApiHandlerConfig<TResource = any> {
  resource: ResourceOperations<TResource>;
  schemas: {
    create: ZodSchema;
    update: ZodSchema;
    list: ZodSchema;
  };
  resourceName: string;
  requireAuth?: boolean;
  customAuth?: (session: Session | null) => boolean | Promise<boolean>;
}

/**
 * Unified API handler for all CRUD operations
 * Completely eliminates route boilerplate
 * Provides consistent error handling and response formatting
 */
export class ApiHandler<TResource = any> {
  constructor(private config: ApiHandlerConfig<TResource>) {}

  /**
   * GET - List resources or get one by ID
   */
  async handleGet(
    request: NextRequest,
    params: { id?: string; resourceId?: string }
  ) {
    try {
      await this.checkAuth(request);

      // Get single resource
      if (params.resourceId) {
        const item = await this.config.resource.getOne(params.resourceId);
        if (!item) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(item);
      }

      // List resources
      const { searchParams } = new URL(request.url);
      const query = this.config.schemas.list.parse({
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "20",
        search: searchParams.get("search") || undefined,
        sortBy: searchParams.get("sortBy") || "name",
        sortOrder: searchParams.get("sortOrder") || "asc",
      });

      const result = await this.config.resource.list({
        where: params.id
          ? { campaignId: params.id, deletedAt: null }
          : { deletedAt: null },
        ...(query as object),
      });

      return NextResponse.json(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST - Create new resource
   */
  async handlePost(request: NextRequest, params: { id?: string }) {
    try {
      const session = await this.checkAuth(request);
      const body = await request.json();

      const validated = this.config.schemas.create.parse(body);

      const item = await this.config.resource.create(
        {
          ...(validated as object),
          ...(params.id && { campaignId: params.id }),
        },
        {
          userId: session?.user?.id,
          campaignId: params.id,
        }
      );

      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH - Update existing resource
   */
  async handlePatch(
    request: NextRequest,
    params: { id?: string; resourceId?: string }
  ) {
    try {
      const session = await this.checkAuth(request);

      if (!params.resourceId) {
        return NextResponse.json(
          { error: "Resource ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validated = this.config.schemas.update.parse(body);

      const item = await this.config.resource.update(
        params.resourceId,
        validated,
        {
          userId: session?.user?.id,
          campaignId: params.id,
        }
      );

      return NextResponse.json(item);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE - Delete resource
   */
  async handleDelete(
    request: NextRequest,
    params: { id?: string; resourceId?: string }
  ) {
    try {
      const session = await this.checkAuth(request);

      if (!params.resourceId) {
        return NextResponse.json(
          { error: "Resource ID required" },
          { status: 400 }
        );
      }

      await this.config.resource.delete(params.resourceId, {
        userId: session?.user?.id,
        campaignId: params.id,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check authentication
   */
  private async checkAuth(request: NextRequest) {
    if (this.config.requireAuth === false) return null;

    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    if (this.config.customAuth) {
      const allowed = await this.config.customAuth(session);
      if (!allowed) {
        throw new Error("FORBIDDEN");
      }
    }

    return session;
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown) {
    if (error instanceof Error) {
      switch (error.message) {
        case "UNAUTHORIZED":
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        case "FORBIDDEN":
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        case "NOT_FOUND":
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        default:
          // Check for Zod validation errors
          if ((error as any).name === "ZodError") {
            return NextResponse.json(
              { error: "Validation failed", details: (error as any).issues },
              { status: 400 }
            );
          }
      }
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Factory function to create API handler
 */
export function createApiHandler<TResource = any>(
  config: ApiHandlerConfig<TResource>
) {
  return new ApiHandler<TResource>(config);
}
