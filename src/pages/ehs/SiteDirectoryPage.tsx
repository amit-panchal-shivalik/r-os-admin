import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Loader,
  Badge,
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useSites } from '@/hooks/useSites';
import { useForm, Controller } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { showMessage } from '@/utils/Constant';

const SiteDirectoryPage = () => {
  const { sites, loading, refresh, createNewSite } = useSites();
  const [modalOpened, setModalOpened] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string; location?: string; companyName?: string; code?: string }>();
  const { can, loading: permissionsLoading } = usePermissions();

  const canView = can('SiteDirectory', 'view');
  const canCreate = can('SiteDirectory', 'add');

  const onSubmit = async (values: { name: string; location?: string; companyName?: string; code?: string }) => {
    if (!canCreate) {
      showMessage('You do not have permission to add sites', 'error');
      return;
    }
    await createNewSite(values);
    setModalOpened(false);
    reset({ name: '', location: '', companyName: '', code: '' });
  };

  return (
    <EhsPageLayout
      title="Site Directory"
      description="Manage project sites and locations to reuse across every EHS form without retyping."
      actions={
        <Group gap="xs">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => canView && refresh()}
            disabled={!canView}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
              Add Site
            </Button>
          ) : null}
        </Group>
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" title="Access restricted">
          You do not have permission to view sites. Contact a SuperAdmin to request access.
        </Alert>
      ) : (
        <Card withBorder shadow="sm" radius="md" padding="lg">
          {loading ? (
            <Group justify="center" py="lg">
              <Loader size="sm" />
            </Group>
          ) : (
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sites.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text size="sm" c="dimmed" ta="center">
                        No sites captured yet. Use "Add Site" to get started.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  sites.map((site) => (
                    <Table.Tr key={site._id}>
                      <Table.Td>{site.name}</Table.Td>
                      <Table.Td>{site.location ?? '—'}</Table.Td>
                      <Table.Td>{site.companyName ?? '—'}</Table.Td>
                      <Table.Td>{site.code ?? '—'}</Table.Td>
                      <Table.Td>
                        <Badge color={site.isActive ? 'green' : 'red'} variant="light">
                          {site.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      )}

      <Modal
        opened={modalOpened && canCreate}
        onClose={() => setModalOpened(false)}
        title="Add Site"
        size="lg"
        centered
        keepMounted
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Site name is required' }}
              render={({ field }) => (
                <TextInput {...field} label="Site Name" placeholder="Site" error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="location"
              render={({ field }) => <TextInput {...field} label="Location" placeholder="City / State" />}
            />
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => (
                <TextInput {...field} label="Company" placeholder="Owning organization" />
              )}
            />
            <Controller
              control={control}
              name="code"
              render={({ field }) => <TextInput {...field} label="Code" placeholder="Site code" />}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!canCreate}>
                Save Site
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </EhsPageLayout>
  );
};

export default SiteDirectoryPage;
