import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Group, Text, Image, Badge, Rating, Paper, Modal, ScrollArea, Button } from '@mantine/core';
import vendorsJson from '@/utils/json/Vendor_Dummy_Json.json';
import { useTerritorySelection } from '@/context/TerritoryContext';
import { openChatWithVendor } from '@/lib/chat';

type Vendor = {
  id: number | string;
  name: string;
  type: string;
  territory: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  services?: string[];
  image?: string;
  latitude?: number;
  longitude?: number;
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a';

export const TerritoryVendorPage = () => {
  const data = useMemo(() => (vendorsJson as unknown as Vendor[]) || [], []);
  const [list] = useState<Vendor[]>(data);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const { selectedTerritory } = useTerritorySelection();

  const normalize = (s?: string) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const currentTerritoryKey = normalize(selectedTerritory?.name);
  const isAllTerritory =
    (selectedTerritory?.id && normalize(String(selectedTerritory.id)) === 'all') ||
    ['all', 'allterritory', 'allterritories', 'allareas', 'allzones'].includes(currentTerritoryKey);

  const filtered = useMemo(() => {
    if (!currentTerritoryKey || isAllTerritory) return list;
    return list.filter((v) => {
      const vt = normalize(v.territory);
      // match if exact or one includes the other to be resilient to naming
      return vt === currentTerritoryKey || vt.includes(currentTerritoryKey) || currentTerritoryKey.includes(vt);
    });
  }, [list, currentTerritoryKey, isAllTerritory]);

  return (
    <div className="mt-5">
      <PageHeader title="Territory Vendors" description="Vendors and partners" />
      <Paper p="md">
        {selectedTerritory?.name && (
          <Group gap={8} mb={12}>
            <Text size="sm" c="dimmed">Showing vendors in</Text>
            <Badge variant="light" color="blue">{selectedTerritory.name}</Badge>
            <Text size="sm" c="dimmed">({filtered.length})</Text>
          </Group>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <Card
              key={v.id}
              withBorder
              radius="md"
              shadow="sm"
              className="hover:shadow-md transition cursor-pointer"
              onClick={() => setSelected(v)}
            >
              <Card.Section>
                <Image
                  src={v.image || PLACEHOLDER_IMG}
                  alt={v.name}
                  h={140}
                  className="object-cover"
                />
              </Card.Section>
              <Group justify="space-between" mt="sm">
                <Text fw={700} lineClamp={1}>
                  {v.name}
                </Text>
                {typeof v.rating === 'number' && <Rating value={v.rating} readOnly fractions={2} size="sm" />}
              </Group>
              <Group gap={6} mt={8}>
                <Badge variant="light" color="blue">
                  {v.type}
                </Badge>
                <Badge variant="light" color="gray">
                  {v.territory}
                </Badge>
                <Button
                  size="xs"
                  variant="light"
                  color="indigo"
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChatWithVendor({ id: String(v.id), name: v.name, image: v.image });
                  }}
                >
                  Message
                </Button>
              </Group>
              {v.address && (
                <Text size="sm" c="dimmed" mt={8} lineClamp={2}>
                  {v.address}
                </Text>
              )}
              {v.services && v.services.length > 0 && (
                <Group gap={6} mt={10} className="flex-wrap">
                  {v.services.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" color="teal">
                      {s}
                    </Badge>
                  ))}
                  {v.services.length > 3 && (
                    <Badge variant="outline" color="teal">+{v.services.length - 3}</Badge>
                  )}
                </Group>
              )}
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                {v.email && <div>Email: {v.email}</div>}
                {v.phone && <div>Phone: {v.phone}</div>}
              </div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <Text size="sm" c="dimmed" mt={12}>No vendors found for the selected territory.</Text>
        )}
        <Modal
          opened={!!selected}
          onClose={() => setSelected(null)}
          size="xl"
          centered
          title={<Text fw={700}>{selected?.name}</Text>}
        >
          {selected && (
            <ScrollArea.Autosize mah={"70vh"} className="pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Image
                    src={selected.image || PLACEHOLDER_IMG}
                    alt={selected.name}
                    radius="md"
                    className="w-full h-[220px] object-cover"
                  />
                  {selected.address && (
                    <Text size="sm" c="dimmed" mt={8}>
                      {selected.address}
                    </Text>
                  )}
                </div>
                <div className="space-y-2">
                  <Group gap={8}>
                    <Badge variant="light" color="blue">{selected.type}</Badge>
                    <Badge variant="light" color="gray">{selected.territory}</Badge>
                    {typeof selected.rating === 'number' && (
                      <Rating value={selected.rating} readOnly fractions={2} size="sm" />
                    )}
                  </Group>
                  <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    onClick={() => openChatWithVendor({ id: String(selected.id), name: selected.name, image: selected.image })}
                  >
                    Message {selected.name}
                  </Button>
                  <div className="text-sm text-gray-700 space-y-1">
                    {selected.email && (
                      <div>
                        <Text span fw={600}>Email: </Text>
                        <Text span>{selected.email}</Text>
                      </div>
                    )}
                    {selected.phone && (
                      <div>
                        <Text span fw={600}>Phone: </Text>
                        <Text span>{selected.phone}</Text>
                      </div>
                    )}
                    {(typeof selected.latitude === 'number' && typeof selected.longitude === 'number') && (
                      <div>
                        <Text span fw={600}>Coordinates: </Text>
                        <Text span>{selected.latitude}, {selected.longitude}</Text>
                      </div>
                    )}
                  </div>
                  {selected.services && selected.services.length > 0 && (
                    <div className="mt-2">
                      <Text fw={600} size="sm" mb={6}>Services</Text>
                      <Group gap={8} className="flex-wrap">
                        {selected.services.map((s) => (
                          <Badge key={s} variant="outline" color="teal">{s}</Badge>
                        ))}
                      </Group>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea.Autosize>
          )}
        </Modal>
      </Paper>
    </div>
  );
};

export default TerritoryVendorPage;

