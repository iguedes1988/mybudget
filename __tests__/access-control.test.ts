import { describe, it, expect } from "@jest/globals";

// Test IDOR and access control logic used in buildOwnerFilter and authorization checks
describe("Access Control (IDOR Prevention)", () => {
  // Simulates the buildOwnerFilter function from actions/expenses.ts
  function buildOwnerFilter(
    session: { user: { id: string; role: string; teamId?: string } },
    overrideUserId?: string,
    memberId?: string
  ): Record<string, unknown> {
    const isAdmin = session.user.role === "ADMIN";

    // Admin overriding to see specific user
    if (isAdmin && overrideUserId) {
      return { userId: overrideUserId };
    }

    // Team user: query by teamId
    if (session.user.teamId) {
      const where: Record<string, unknown> = { teamId: session.user.teamId };
      if (memberId && memberId !== "all") {
        where.createdById = memberId;
      }
      return where;
    }

    // Personal account: query by userId
    return { userId: session.user.id };
  }

  describe("Personal user access", () => {
    const personalUser = { user: { id: "user-1", role: "USER" } };

    it("should only return own data for personal user", () => {
      const filter = buildOwnerFilter(personalUser);
      expect(filter).toEqual({ userId: "user-1" });
    });

    it("should ignore userId override for non-admin", () => {
      const filter = buildOwnerFilter(personalUser, "user-2");
      // Non-admin: overrideUserId is ignored because role is not ADMIN
      expect(filter).toEqual({ userId: "user-1" });
    });

    it("should ignore memberId for personal user (no team)", () => {
      const filter = buildOwnerFilter(personalUser, undefined, "member-1");
      expect(filter).toEqual({ userId: "user-1" });
    });

    it("should prevent access to other users' data", () => {
      const filter = buildOwnerFilter(personalUser);
      expect(filter.userId).not.toBe("user-2");
      expect(filter.userId).toBe("user-1");
    });
  });

  describe("Team user access", () => {
    const teamUser = { user: { id: "user-1", role: "USER", teamId: "team-1" } };

    it("should filter by teamId for team users", () => {
      const filter = buildOwnerFilter(teamUser);
      expect(filter).toEqual({ teamId: "team-1" });
    });

    it("should allow filtering by member within team", () => {
      const filter = buildOwnerFilter(teamUser, undefined, "user-2");
      expect(filter).toEqual({ teamId: "team-1", createdById: "user-2" });
    });

    it("should not allow access to other teams", () => {
      const filter = buildOwnerFilter(teamUser);
      expect(filter.teamId).toBe("team-1");
      expect(filter.teamId).not.toBe("team-2");
    });

    it("should handle 'all' memberId", () => {
      const filter = buildOwnerFilter(teamUser, undefined, "all");
      expect(filter).toEqual({ teamId: "team-1" });
      expect(filter).not.toHaveProperty("createdById");
    });
  });

  describe("Admin user access", () => {
    const adminUser = { user: { id: "admin-1", role: "ADMIN" } };

    it("should allow admin to view own data by default", () => {
      const filter = buildOwnerFilter(adminUser);
      expect(filter).toEqual({ userId: "admin-1" });
    });

    it("should allow admin to override userId", () => {
      const filter = buildOwnerFilter(adminUser, "user-2");
      expect(filter).toEqual({ userId: "user-2" });
    });

    it("should allow admin to view any user's data", () => {
      const filter1 = buildOwnerFilter(adminUser, "user-1");
      const filter2 = buildOwnerFilter(adminUser, "user-2");
      const filter3 = buildOwnerFilter(adminUser, "user-3");

      expect(filter1.userId).toBe("user-1");
      expect(filter2.userId).toBe("user-2");
      expect(filter3.userId).toBe("user-3");
    });
  });

  describe("Expense authorization", () => {
    function isAuthorized(
      session: { userId: string; role: string; teamId?: string },
      expense: { userId: string; teamId?: string | null }
    ): boolean {
      const isAdmin = session.role === "ADMIN";
      const isTeamExpense = expense.teamId && expense.teamId === session.teamId;
      const isOwner = expense.userId === session.userId;

      return isOwner || !!isTeamExpense || isAdmin;
    }

    it("should authorize owner", () => {
      expect(
        isAuthorized(
          { userId: "user-1", role: "USER" },
          { userId: "user-1", teamId: null }
        )
      ).toBe(true);
    });

    it("should deny non-owner non-admin", () => {
      expect(
        isAuthorized(
          { userId: "user-1", role: "USER" },
          { userId: "user-2", teamId: null }
        )
      ).toBe(false);
    });

    it("should authorize admin for any expense", () => {
      expect(
        isAuthorized(
          { userId: "admin-1", role: "ADMIN" },
          { userId: "user-2", teamId: null }
        )
      ).toBe(true);
    });

    it("should authorize team member for team expense", () => {
      expect(
        isAuthorized(
          { userId: "user-1", role: "USER", teamId: "team-1" },
          { userId: "user-2", teamId: "team-1" }
        )
      ).toBe(true);
    });

    it("should deny team member for other team's expense", () => {
      expect(
        isAuthorized(
          { userId: "user-1", role: "USER", teamId: "team-1" },
          { userId: "user-2", teamId: "team-2" }
        )
      ).toBe(false);
    });
  });
});
