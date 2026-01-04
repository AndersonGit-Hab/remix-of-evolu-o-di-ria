import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GameDay } from '@/types/game';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface XpChartProps {
  days: GameDay[];
}

export const XpChart = ({ days }: XpChartProps) => {
  const chartData = useMemo(() => {
    const last30Days = days
      .filter(day => day.status === 'closed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
      .map(day => {
        const date = new Date(day.date);
        const netXp = day.xpGained - day.xpLost;
        return {
          day: date.getDate(),
          date: day.date,
          netXp,
          xpGained: day.xpGained,
          xpLost: day.xpLost,
        };
      });
    return last30Days;
  }, [days]);

  const totalNetXp = chartData.reduce((acc, d) => acc + d.netXp, 0);
  const avgNetXp = chartData.length > 0 ? Math.round(totalNetXp / chartData.length) : 0;

  const chartConfig = {
    netXp: {
      label: 'XP Líquido',
      color: 'hsl(var(--primary))',
    },
  };

  if (chartData.length === 0) {
    return (
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-gradient-gold">Evolução de XP</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dia encerrado ainda. Complete dias para ver seu progresso!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-dark">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gradient-gold">Evolução de XP</CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            {totalNetXp >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={totalNetXp >= 0 ? 'text-success' : 'text-destructive'}>
              {totalNetXp >= 0 ? '+' : ''}{totalNetXp} XP total
            </span>
          </div>
          <div className="text-muted-foreground">
            Média: {avgNetXp >= 0 ? '+' : ''}{avgNetXp}/dia
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      const numValue = Number(value);
                      return [`${numValue >= 0 ? '+' : ''}${numValue} XP`, 'XP Líquido'];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `Dia ${payload[0].payload.day}`;
                      }
                      return `Dia ${label}`;
                    }}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="netXp" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
