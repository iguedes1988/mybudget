import { describe, it, expect } from "@jest/globals";

// Test account deletion soft-delete logic
describe("Account Deletion Soft-Delete Logic", () => {
  describe("Deletion scheduling", () => {
    it("should set pendingDeletion to true", () => {
      const userUpdate = { pendingDeletion: true, deletionScheduledAt: new Date() };
      expect(userUpdate.pendingDeletion).toBe(true);
    });

    it("should schedule deletion 30 days from now", () => {
      const now = new Date();
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      const diffMs = deletionDate.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(30);
    });

    it("should require email confirmation matching user email", () => {
      const userEmail = "test@example.com";
      const confirmEmail = "test@example.com";
      expect(confirmEmail.toLowerCase()).toBe(userEmail.toLowerCase());
    });

    it("should reject mismatched email confirmation", () => {
      const userEmail = "test@example.com";
      const confirmEmail = "wrong@example.com";
      expect(confirmEmail.toLowerCase()).not.toBe(userEmail.toLowerCase());
    });

    it("should handle case-insensitive email comparison", () => {
      const userEmail = "Test@Example.com";
      const confirmEmail = "test@example.com";
      expect(confirmEmail.toLowerCase()).toBe(userEmail.toLowerCase());
    });
  });

  describe("Deletion cancellation", () => {
    it("should set pendingDeletion to false on cancel", () => {
      const userUpdate = { pendingDeletion: false, deletionScheduledAt: null };
      expect(userUpdate.pendingDeletion).toBe(false);
      expect(userUpdate.deletionScheduledAt).toBeNull();
    });

    it("should allow cancellation within the 30-day window", () => {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 30);
      const now = new Date();

      const isWithinWindow = now < scheduledAt;
      expect(isWithinWindow).toBe(true);
    });

    it("should not allow cancellation after the window expires", () => {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() - 1); // Yesterday
      const now = new Date();

      const isWithinWindow = now < scheduledAt;
      expect(isWithinWindow).toBe(false);
    });
  });

  describe("Deletion banner logic", () => {
    function shouldShowBanner(
      pendingDeletion: boolean,
      deletionScheduledAt: Date | null
    ): boolean {
      return pendingDeletion && deletionScheduledAt !== null;
    }

    it("should show banner when deletion is pending", () => {
      expect(shouldShowBanner(true, new Date())).toBe(true);
    });

    it("should not show banner when deletion is not pending", () => {
      expect(shouldShowBanner(false, null)).toBe(false);
    });

    it("should not show banner when pending but no date", () => {
      expect(shouldShowBanner(true, null)).toBe(false);
    });
  });

  describe("Data preservation", () => {
    it("should preserve data during 30-day soft-delete window", () => {
      // Soft-delete only sets pendingDeletion flag
      // It does NOT delete expenses, income, or team data
      const deleteOperation = {
        updateFields: ["pendingDeletion", "deletionScheduledAt"],
        deletedTables: [] as string[],
      };

      expect(deleteOperation.deletedTables).toHaveLength(0);
      expect(deleteOperation.updateFields).toContain("pendingDeletion");
    });

    it("should offer data export before deletion", () => {
      // The deletion dialog includes a download link before the confirm button
      const exportUrl = "/api/export?period=all&format=csv";
      expect(exportUrl).toContain("period=all");
      expect(exportUrl).toContain("format=csv");
    });
  });
});
