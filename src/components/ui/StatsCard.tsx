
import { Paper, Text, Group, Box, rem } from '@mantine/core';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  diff?: number;
  color?: string;
  icon?: React.ReactNode;
  progress?: number;
  dark?: boolean;
  compact?: boolean;
  size?: 'default' | 'compact' | 'mini';
}

export const StatsCard = ({ 
  title, 
  value, 
  diff, 
  color = 'gray', 
  icon, 
  progress,
  dark = false,
  compact = false,
  size,
}: StatsCardProps) => {
  const DiffIcon = diff && diff > 0 ? IconArrowUp : IconArrowDown;
  const mode: 'default' | 'compact' | 'mini' = size ?? (compact ? 'compact' : 'default');
  const cfg = {
    default: {
      pad: 'xl' as const,
      titleSize: 'sm' as const,
      valueSize: '2xl' as const,
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      prog: 50,
      radius: 12,
    },
    compact: {
      pad: 'sm' as const,
      titleSize: 'xs' as const,
      valueSize: 'xl' as const,
      shadow: '0 1px 2px rgba(0,0,0,.06)',
      prog: 40,
      radius: 12,
    },
    mini: {
      pad: 'xs' as const,
      titleSize: 'xs' as const,
      valueSize: 'md' as const,
      shadow: '0 1px 1px rgba(0,0,0,.05)',
      prog: 32,
      radius: 10,
    },
  }[mode];
  
  return (
    <Paper 
      p={cfg.pad}
      radius={String(cfg.radius)}
      style={{
        backgroundColor: dark ? '#111827' : '#ffffff',
        color: dark ? '#ffffff' : '#111827',
        border: '1px solid #e5e7eb',
        boxShadow: cfg.shadow,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        if (mode === 'default') {
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" mb="xs" wrap="nowrap">
            {icon && (
              <Box style={{ color: dark ? '#9ca3af' : '#6b7280', flexShrink: 0 }}>
                {icon}
              </Box>
            )}
            <Text 
              size={cfg.titleSize}
              fw={500}
              style={{ 
                color: dark ? '#9ca3af' : '#6b7280',
                wordBreak: 'break-word'
              }}
              lineClamp={1}
            >
              {title}
            </Text>
          </Group>
          
          <Text 
            fw={700} 
            size={cfg.valueSize}
            style={{ 
              color: dark ? '#ffffff' : '#111827', 
              marginBottom: rem(8),
              wordBreak: 'break-word'
            }}
            lineClamp={1}
          >
            {value}
          </Text>
          
          {diff !== undefined && (
            <Group gap="xs" wrap="nowrap">
              <Group gap={4} wrap="nowrap">
                <DiffIcon 
                  size={16} 
                  style={{ color: diff > 0 ? '#10b981' : '#ef4444' }}
                />
                <Text 
                  size="sm" 
                  fw={600}
                  style={{ color: diff > 0 ? '#10b981' : '#ef4444' }}
                >
                  {Math.abs(diff)}%
                </Text>
              </Group>
              <Text 
                size="sm" 
                style={{ color: dark ? '#9ca3af' : '#6b7280' }}
                visibleFrom="sm"
              >
                vs last week
              </Text>
            </Group>
          )}
        </Box>
        
        {progress !== undefined && (
          <Box
            style={{
              width: rem(cfg.prog),
              height: rem(cfg.prog),
              borderRadius: rem(cfg.prog / 2),
              backgroundColor: dark ? '#374151' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
            visibleFrom="sm"
          >
            <Text 
              size={mode === 'mini' ? 'xs' : 'xs'} 
              fw={700}
              style={{ color: dark ? '#ffffff' : '#111827' }}
            >
              {progress}%
            </Text>
          </Box>
        )}
      </Group>
    </Paper>
  );
};
