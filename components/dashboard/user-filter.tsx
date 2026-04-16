"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getYearRange } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface DashboardUserFilterProps {
  users: User[];
  selectedUserId?: string;
  selectedYear: number;
  isAdmin?: boolean;
  teamMembers?: TeamMember[];
  selectedMemberId?: string;
}

export function DashboardUserFilter({
  users,
  selectedUserId,
  selectedYear,
  isAdmin,
  teamMembers,
  selectedMemberId,
}: DashboardUserFilterProps) {
  const router = useRouter();
  const years = getYearRange();

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const userId = overrides.userId !== undefined ? overrides.userId : selectedUserId;
    const year = overrides.year !== undefined ? overrides.year : selectedYear.toString();
    const memberId = overrides.memberId !== undefined ? overrides.memberId : selectedMemberId;

    if (userId) params.set("userId", userId);
    if (year) params.set("year", year);
    if (memberId) params.set("memberId", memberId);

    return `/dashboard?${params.toString()}`;
  }

  function handleUserChange(userId: string) {
    router.push(buildUrl({ userId: userId === "all" ? undefined : userId }));
  }

  function handleYearChange(year: string) {
    router.push(buildUrl({ year }));
  }

  function handleMemberChange(memberId: string) {
    router.push(buildUrl({ memberId: memberId === "all" ? undefined : memberId }));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isAdmin && users.length > 0 && (
        <Select value={selectedUserId || "all"} onValueChange={handleUserChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users (mine)</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {teamMembers && teamMembers.length > 1 && (
        <Select value={selectedMemberId || "all"} onValueChange={handleMemberChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
