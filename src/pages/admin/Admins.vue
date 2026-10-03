<script setup>
import { onMounted, ref } from 'vue'
import AdminFormModal from '../../components/admin/AdminFormModal.vue'
import AdminStatusModal from '../../components/admin/AdminStatusModal.vue'
import AdminPasswordModal from '../../components/admin/AdminPasswordModal.vue'
import { ShieldCheck, Plus, Pencil, KeyRound, Power } from 'lucide-vue-next'
import api from '../../services/api'

const admins = ref([])
const loading = ref(false)
const error = ref(null)
const showAdminModal = ref(false)
const showAdminStatusModal = ref(false)
const selectedStatusAdmin = ref(null)
const selectedAdmin = ref(null)
const updatingAdminStatus = ref(false)
const adminStatusError = ref(null)
const savingAdmin = ref(false)
const adminFormError = ref(null)

const showAdminPasswordModal = ref(false)
const selectedPasswordAdmin = ref(null)
const resettingAdminPassword = ref(false)
const adminPasswordError = ref(null)

const fetchAdmins = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/admins')

    admins.value = response.data.data.admins
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Unable to load administrators.'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedAdmin.value = null
  console.log(
        'Opening create modal:',
        selectedAdmin.value,
    )
  adminFormError.value = null
  showAdminModal.value = true
}

const openEditModal = (admin) => {
  console.log('Selected admin:', admin)
  selectedAdmin.value = admin
  adminFormError.value = null
  showAdminModal.value = true
}

const closeAdminModal = () => {
  if (savingAdmin.value) return

  showAdminModal.value = false
  selectedAdmin.value = null
  adminFormError.value = null
}

const openStatusModal = (admin) => {
  selectedStatusAdmin.value = admin
  adminStatusError.value = null
  showAdminStatusModal.value = true
}

const closeStatusModal = () => {
  if (updatingAdminStatus.value) return

  showAdminStatusModal.value = false
  selectedStatusAdmin.value = null
  adminStatusError.value = null
}

const handleAdminStatusUpdate = async () => {
  if (!selectedStatusAdmin.value) return

  adminStatusError.value = null
  updatingAdminStatus.value = true

  try {
    await api.patch(
      `/admins/${selectedStatusAdmin.value.id}/status`,
      {
        isActive: !selectedStatusAdmin.value.isActive,
      },
    )

    closeStatusModal()

    await fetchAdmins()
  } catch (err) {
    adminStatusError.value =
      err.response?.data?.message ||
      'Unable to update administrator status.'
  } finally {
    updatingAdminStatus.value = false
  }
}

const openPasswordModal = (admin) => {
  selectedPasswordAdmin.value = admin
  adminPasswordError.value = null
  showAdminPasswordModal.value = true
}

const closePasswordModal = () => {
  if (resettingAdminPassword.value) return

  showAdminPasswordModal.value = false
  selectedPasswordAdmin.value = null
  adminPasswordError.value = null
}

const handleAdminPasswordReset = async (formData) => {
  adminPasswordError.value = null

  if (!formData.password) {
    adminPasswordError.value = 'Password is required.'
    return
  }

  if (formData.password.length < 8) {
    adminPasswordError.value =
      'Password must be at least 8 characters.'
    return
  }

  if (!selectedPasswordAdmin.value) return

  resettingAdminPassword.value = true

  try {
    await api.patch(
      `/admins/${selectedPasswordAdmin.value.id}/password`,
      {
        password: formData.password,
      },
    )

    closePasswordModal()

    await fetchAdmins()
  } catch (err) {
    adminPasswordError.value =
      err.response?.data?.message ||
      'Unable to reset administrator password.'
  } finally {
    resettingAdminPassword.value = false
  }
}

const handleAdminSubmit = async (formData) => {
  adminFormError.value = null
  savingAdmin.value = true

  try {
    if (selectedAdmin.value) {
      await api.patch(
        `/admins/${selectedAdmin.value.id}`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        },
      )
    } else {
      if (!formData.password) {
        adminFormError.value =
          'Password is required.'

        return
      }

      if (formData.password.length < 8) {
        adminFormError.value =
          'Password must be at least 8 characters.'

        return
      }

      await api.post('/admins', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    }

    closeAdminModal()

    await fetchAdmins()
  } catch (err) {
    adminFormError.value =
      err.response?.data?.message ||
      'Unable to save administrator.'
  } finally {
    savingAdmin.value = false
  }
}

onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-6 w-6" />

          <h1 class="text-2xl font-semibold">
            Administrators
          </h1>
        </div>

        <p class="mt-1 text-sm text-gray-500">
          Manage administrators and their access to the system.
        </p>
      </div>

      <button
      type="button"
      @click="openCreateModal"
        class="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        <Plus class="h-4 w-4" />
        Add Administrator
      </button>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-xl border bg-white p-8 text-center text-sm text-gray-500"
    >
      Loading administrators...
    </div>

    <!-- Admin table -->
    <div
      v-else
      class="overflow-hidden rounded-xl border bg-white"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b bg-gray-50">
            <tr>
              <th class="px-6 py-4 font-medium text-gray-600">
                Administrator
              </th>

              <th class="px-6 py-4 font-medium text-gray-600">
                Role
              </th>

              <th class="px-6 py-4 font-medium text-gray-600">
                Status
              </th>

              <th class="px-6 py-4 font-medium text-gray-600">
                Created
              </th>

              <th class="px-6 py-4 text-right font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="divide-y">
            <tr
              v-for="admin in admins"
              :key="admin.id"
              class="hover:bg-gray-50"
            >
              <!-- Administrator -->
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">
                  {{ admin.name }}
                </div>

                <div class="text-gray-500">
                  {{ admin.email }}
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4">
                <span
                  class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium"
                >
                  {{ admin.role }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    admin.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  "
                >
                  {{ admin.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Created -->
              <td class="px-6 py-4 text-gray-500">
                {{
                  new Date(
                    admin.createdAt,
                  ).toLocaleDateString()
                }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="openEditModal(admin)"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    title="Edit administrator"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    @click="openPasswordModal(admin)"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    title="Reset password"
                    >
                    <KeyRound class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    @click="openStatusModal(admin)"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    :title="admin.isActive? 'Deactivate administrator'
                    :'Activate administrator' ">
                    <Power class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-if="admins.length === 0">
              <td
                colspan="5"
                class="px-6 py-12 text-center text-gray-500"
              >
                No administrators found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  
  <AdminFormModal
    :key="selectedAdmin?.id ?? 'create'"
    :open="showAdminModal"
    :admin="selectedAdmin"
    :loading="savingAdmin"
    :error="adminFormError"
    @close="closeAdminModal"
    @submit="handleAdminSubmit"
/>


  <AdminStatusModal
    :key="selectedStatusAdmin?.id ?? 'status'"
    :open="showAdminStatusModal"
    :admin="selectedStatusAdmin"
    :loading="updatingAdminStatus"
    :error="adminStatusError"
    @close="closeStatusModal"
    @confirm="handleAdminStatusUpdate"
/>

<AdminPasswordModal
  :key="selectedPasswordAdmin?.id ?? 'password'"
  :open="showAdminPasswordModal"
  :admin="selectedPasswordAdmin"
  :loading="resettingAdminPassword"
  :error="adminPasswordError"
  @close="closePasswordModal"
  @submit="handleAdminPasswordReset"
/>
</template>