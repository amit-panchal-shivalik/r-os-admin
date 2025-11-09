import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useContractors } from '@/hooks/useContractors';
import { useForm, Controller } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { showMessage } from '@/utils/Constant';

const ContractorDirectoryPage = () => {
  const { contractors, loading, refresh, createNewContractor } = useContractors();
  const [modalOpened, setModalOpened] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getFieldState,
    formState: { isSubmitting },
  } = useForm<{
    name: string;
    companyName?: string;
    contactPerson?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
  }>({
    defaultValues: {
      name: '',
      companyName: '',
      contactPerson: '',
      contactNumber: '',
      email: '',
      address: '',
    },
  });
  const { can, loading: permissionsLoading } = usePermissions();

  const canView = can('ContractorDirectory', 'view');
  const canCreate = can('ContractorDirectory', 'add');

  const onSubmit = async (values: {
    name: string;
    companyName?: string;
    contactPerson?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
  }) => {
    if (!canCreate) {
      showMessage('You do not have permission to add contractors', 'error');
      return;
    }
    await createNewContractor(values);
    setModalOpened(false);
    reset({ name: '', companyName: '', contactPerson: '', contactNumber: '', email: '', address: '' });
  };

  return (
    <EhsPageLayout
      title="Contractor Directory"
      description="Maintain contractor profiles for quick reuse across EHS forms."
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
              Add Contractor
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
          You do not have permission to view contractors. Contact a SuperAdmin to request access.
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
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Contact Person</Table.Th>
                  <Table.Th>Contact Number</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Hierarchy</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {contractors.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text size="sm" c="dimmed" ta="center">
                        No contractors saved yet. Use "Add Contractor" to create one.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  contractors.map((contractor) => (
                    <Table.Tr key={contractor._id}>
                      <Table.Td>{contractor.name}</Table.Td>
                      <Table.Td>{contractor.companyName ?? '—'}</Table.Td>
                      <Table.Td>{contractor.contactPerson ?? '—'}</Table.Td>
                      <Table.Td>{contractor.contactNumber ?? '—'}</Table.Td>
                      <Table.Td>{contractor.email ?? '—'}</Table.Td>
                      <Table.Td>
                        <Badge color={contractor.partyProfileId ? 'green' : 'orange'} variant="light">
                          {contractor.partyProfileId ? 'Linked' : 'Link Pending'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" variant="light">
                          Active
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
        title="Add Contractor"
        size="lg"
        centered
        keepMounted
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Contractor name is required' }}
              render={({ field }) => <TextInput {...field} label="Contractor" placeholder="Name" />}
            />
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => <TextInput {...field} label="Company" placeholder="Company" />}
            />
            <Controller
              control={control}
              name="contactPerson"
              render={({ field }) => (
                <TextInput {...field} label="Contact Person" placeholder="Primary contact" />
              )}
            />
            <Controller
              control={control}
              name="contactNumber"
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Contact Number"
                  placeholder="Phone"
                  error={getFieldState('contactNumber').error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => <TextInput {...field} label="Email" placeholder="Email" />}
            />
            <Controller
              control={control}
              name="address"
              render={({ field }) => <TextInput {...field} label="Address" placeholder="Address" />}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!canCreate}>
                Save Contractor
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </EhsPageLayout>
  );
};

export default ContractorDirectoryPage;
