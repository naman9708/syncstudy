"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PARTNER_COLOR, YOU_COLOR } from "@/components/analytics/colors";
import type { ChartPoint } from "@/lib/analytics";

export function StudyHoursChart({ data, hasPartner }: { data: ChartPoint[]; hasPartner: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Study hours</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            {hasPartner && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <Bar dataKey="youHours" name="You" fill={YOU_COLOR} radius={[4, 4, 0, 0]} />
            {hasPartner && <Bar dataKey="partnerHours" name="Partner" fill={PARTNER_COLOR} radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
