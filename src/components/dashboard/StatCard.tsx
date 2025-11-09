import { Card, Text, Group, ThemeIcon, Progress, Badge } from "@mantine/core";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  percentage?: number;
  percentageLabel?: string;
  badge?: {
    text: string;
    color: string;
  };
  subtitle?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  percentage,
  percentageLabel,
  badge,
  subtitle,
}: StatCardProps) => {
  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      className="hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
      style={{ minHeight: '200px' }}
    >
      <div className="flex-grow">
        <Group justify="space-between" mb="md">
          <ThemeIcon
            size={50}
            radius="md"
            variant="light"
            color={color}
          >
            <Icon size={28} />
          </ThemeIcon>
          {badge && (
            <Badge color={badge.color} variant="light" size="lg" style={{ fontSize: '14px', padding: '6px 10px' }}>
              {badge.text}
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed" fw={500} mb={4}>
          {title}
        </Text>

        <Group justify="space-between" align="flex-end" mb="xs">
          <Text size="xl" fw={700} style={{ lineHeight: 1 }}>
            {value}
          </Text>
          {percentageLabel && (
            <Text size="sm" c="dimmed" fw={500}>
              {percentageLabel}
            </Text>
          )}
        </Group>

        {subtitle && (
          <Text size="xs" c="dimmed" mt={4}>
            {subtitle}
          </Text>
        )}
      </div>

      {/* Fixed height spacer for progress bar to maintain consistent card height */}
      <div className="mt-auto pt-md" style={{ minHeight: percentage !== undefined ? 'auto' : '28px' }}>
        {percentage !== undefined && (
          <Progress
            value={percentage}
            color={color}
            size="md"
            radius="xl"
          />
        )}
      </div>
    </Card>
  );
};

