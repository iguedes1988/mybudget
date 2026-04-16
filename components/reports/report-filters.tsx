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

interface ReportFiltersProps {
  isAdmin: boolean;
  users: User[];
  selectedYear: number;
  selectedUserId?: string;
  teamMembers?: TeamMember[];
  selectedMemberId?: string;
}

export function ReportFilters({
  isAdmin,
  users,
  selectedYear,
  selectedUserId,
  teamMembers,
  selectedMemberId,
}: ReportFiltersProps) {
  const router = useRouter();
  const years = getYearRange();

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const year = overrides.year !== undefined ? overrides.year : selectedYear.toString();
    const userId = overrides.userId !== undefined ? overrides.userId : selectedUserId;
    const memberId = overrides.memberId !== undefined ? overrides.memberId : selectedMemberId;

    if (year) params.set("year", year);
    if (userId) params.set("userId", userId);
    if (memberId) params.set("memberId", memberId);

    return `/reports?${params.toString()}`;
  }

  function updateYear(value: string) {
    router.push(buildUrl({ year: value }));
  }

  function updateUser(value: string) {
    router.push(buildUrl({ userId: value === "all" ? undefined : value }));
  }

  function updateMember(value: string) {
    router.push(buildUrl({ memberId: value === "all" ? undefined : value }));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isAdmin && users.length > 0 && (
        <Select value={selectedUserId || "all"} onValueChange={updateUser}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="My data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">My data</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {teamMembers && teamMembers.length > 1 && (
        <Select value={selectedMemberId || "all"} onValueChange={updateMember}>
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

      <Select value={selectedYear.toString()} onValueChange={updateYear}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
