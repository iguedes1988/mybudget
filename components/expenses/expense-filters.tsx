"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, MONTHS } from "@/lib/constants";
import { getYearRange } from "@/lib/utils";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface ExpenseFiltersProps {
  isAdmin?: boolean;
  users?: User[];
  teamMembers?: TeamMember[];
}

export function ExpenseFilters({ isAdmin, users, teamMembers }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const years = getYearRange();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentFilters = {
    month: searchParams.get("month") || "all",
    year: searchParams.get("year") || "all",
    category: searchParams.get("category") || "all",
    userId: searchParams.get("userId") || "all",
    memberId: searchParams.get("memberId") || "all",
  };

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/expenses?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/expenses?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    router.push("/expenses");
  }

  const hasFilters =
    currentFilters.month !== "all" ||
    currentFilters.year !== "all" ||
    currentFilters.category !== "all" ||
    currentFilters.userId !== "all" ||
    currentFilters.memberId !== "all" ||
    !!searchParams.get("search");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendor or notes..."
              aria-label="Search expenses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        {/* Year filter */}
        <Select value={currentFilters.year} onValueChange={(v) => updateFilter("year", v)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month filter */}
        <Select value={currentFilters.month} onValueChange={(v) => updateFilter("month", v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={currentFilters.category} onValueChange={(v) => updateFilter("category", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team member filter */}
        {teamMembers && teamMembers.length > 1 && (
          <Select value={currentFilters.memberId} onValueChange={(v) => updateFilter("memberId", v)}>
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

        {/* Admin user filter */}
        {isAdmin && users && (
          <Select value={currentFilters.userId} onValueChange={(v) => updateFilter("userId", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">My expenses</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1" aria-label="Clear all filters">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
