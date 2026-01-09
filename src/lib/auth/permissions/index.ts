// ============================================================================
// Permission Types
// ============================================================================

export enum Permission {
  READ = "read",
  EDIT = "edit",
  CREATE = "create",
  DELETE = "delete",
  ADMIN = "admin",
  MANAGE = "manage",
  MEMBERS = "members",
  POSTS = "posts",
  PERMS = "permissions",
  DASHBOARD = "dashboard",
  GALLERY = "gallery",
  TEMPLATES = "templates",
  BOOKMARKS = "bookmarks",
  VIEW_ENTITIES = "VIEW_ENTITIES",
  EDIT_ENTITIES = "EDIT_ENTITIES",
  CREATE_ENTITIES = "CREATE_ENTITIES",
  DELETE_ENTITIES = "DELETE_ENTITIES",
  MANAGE_ENTITIES = "MANAGE_ENTITIES",
}

export enum RoleLevel {
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export const RoleLevelLabels: Record<string, string> = {
  [RoleLevel.ADMIN]: "Admin",
  [RoleLevel.MEMBER]: "Member",
  [RoleLevel.VIEWER]: "Viewer",
};

// ============================================================================
// Permissions Functionality (Placeholder for future implementation)
// ============================================================================

// Permissions functionality will be implemented here
