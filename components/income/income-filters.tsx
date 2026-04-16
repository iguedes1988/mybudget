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
import { INCOME_CATEGORIES, MONTHS } from "@/lib/constants";
import { getYearRange } from "@/lib/utils";
import { useState } from "react";

interface IncomeFiltersProps {
  teamMembers?: { id: string; name: string }[];
}

export function IncomeFilters({ teamMembers }: IncomeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const years = getYearRange();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentFilters = {
    month: searchParams.get("month") || "all",
    year: searchParams.get("year") || "all",
    category: searchParams.get("category") || "all",
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
    router.push(`/income?${params.toString()}`);
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
    router.push(`/income?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    router.push("/income");
  }

  const hasFilters =
    currentFilters.month !== "all" ||
    currentFilters.year !== "all" ||
    currentFilters.category !== "all" ||
    currentFilters.memberId !== "all" ||
    !!searchParams.get("search");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search source or notes..."
              aria-label="Search income"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        <Select value={currentFilters.year} onValueChange={(v) => updateFilter("year", v)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.month} onValueChange={(v) => updateFilter("month", v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.category} onValueChange={(v) => updateFilter("category", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INCOME_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {teamMembers && teamMembers.length > 1 && (
          <Select value={currentFilters.memberId} onValueChange={(v) => updateFilter("memberId", v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
