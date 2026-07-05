"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers(page);

  const users = (data?.users ?? []).filter((u: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const pagination = data?.pagination;

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-display">Customers</h1>
        <p className="text-sm text-stone-500 mt-0.5">{pagination?.total ?? 0} registered accounts</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Customer","Email","Role","Orders","AI Gens","Joined","Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-stone-500 px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Users size={32} className="text-stone-300 mx-auto mb-2" />
                      <p className="text-sm text-stone-400">No customers found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-stone-800">{u.fullName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.role === "ADMIN" ? "gold" : "default"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-stone-700">{u._count?.orders ?? 0}</td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs">
                        {u.aiGenerationsThisMonth}/3 this month
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.emailVerified ? "success" : "warning"}>
                          {u.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
              <p className="text-xs text-stone-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}