"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PARTNER_COLOR, YOU_COLOR } from "@/components/analytics/colors";
import type { ChartPoint } from "@/lib/analytics";

export function CompletionChart({ data, hasPartner }: { data: ChartPoint[]; hasPartner: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Completion %</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={36}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            {hasPartner && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <Line
              type="monotone"
              dataKey="youCompletionPct"
              name="You"
              stroke={YOU_COLOR}
              strokeWidth={2}
              dot={false}
            />
            {hasPartner && (
              <Line
                type="monotone"
                dataKey="partnerCompletionPct"
                name="Partner"
                stroke={PARTNER_COLOR}
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
