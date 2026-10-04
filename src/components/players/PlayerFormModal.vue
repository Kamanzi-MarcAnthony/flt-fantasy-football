<script setup>
import { ref, computed } from 'vue'
import { ImagePlus, X, Loader2 } from 'lucide-vue-next'
import { uploadPlayerPhoto } from '../../services/cloudinary'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  position: 'ST',
  ovr: '',
  price: '',
})

const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)
const error = ref('')

const positions = [
  { value: 'GK', label: 'Goalkeeper' },
  { value: 'DEF', label: 'Defender' },
  { value: 'MID', label: 'Midfielder' },
  { value: 'ST', label: 'Striker' },
]

const isBusy = computed(() => props.loading || uploading.value)

const handleFileChange = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  error.value = ''

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    error.value = 'Please upload a JPG, PNG or WEBP image.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image must be smaller than 5MB.'
    return
  }

  selectedFile.value = file

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
}

const removePhoto = () => {
  selectedFile.value = null

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = ''
}

const handleSubmit = async () => {
  error.value = ''

  if (!form.value.name.trim()) {
    error.value = 'Player name is required.'
    return
  }

  if (!form.value.ovr) {
    error.value = 'Player OVR is required.'
    return
  }

  if (!form.value.price) {
    error.value = 'Player price is required.'
    return
  }

  try {
    uploading.value = true

    let photoUrl = null

    if (selectedFile.value) {
      photoUrl = await uploadPlayerPhoto(selectedFile.value)
    }

    emit('submit', {
      name: form.value.name.trim(),
      photoUrl,
      position: form.value.position,
      ovr: Number(form.value.ovr),
      price: Number(form.value.price),
    })
  } catch (err) {
    console.error(err)
    error.value = 'Unable to upload player photo. Please try again.'
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    position: 'ST',
    ovr: '',
    price: '',
  }

  removePhoto()
  error.value = ''
}

const handleClose = () => {
  if (isBusy.value) return

  resetForm()
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
  >
    <div
      class="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#111c1d] shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 class="text-lg font-semibold text-white">
            Add Player
          </h2>

          <p class="mt-1 text-sm text-white/40">
            Add a player to this league
          </p>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          :disabled="isBusy"
          @click="handleClose"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <form
        class="space-y-5 p-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Player Photo -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Player Photo
          </label>

          <div class="flex items-center gap-4">
            <!-- Portrait preview -->
            <div
              class="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <img
                v-if="previewUrl"
                :src="previewUrl"
                alt="Player preview"
                class="h-full w-full object-cover"
              />

              <div
                v-else
                class="flex h-full w-full flex-col items-center justify-center text-white/30"
              >
                <ImagePlus class="h-7 w-7" />

                <span class="mt-2 text-[11px]">
                  Photo
                </span>
              </div>

              <button
                v-if="previewUrl"
                type="button"
                class="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                @click="removePhoto"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Upload button -->
            <div>
              <label
                class="inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <ImagePlus class="mr-2 h-4 w-4" />

                Choose Photo

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleFileChange"
                />
              </label>

              <p class="mt-2 text-xs text-white/30">
                JPG, PNG or WEBP · Max 5MB
              </p>
            </div>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Player Name
          </label>

          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Marcus Rashford"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
          />
        </div>

        <!-- Position -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Position
          </label>

          <select
            v-model="form.position"
            class="w-full rounded-xl border border-white/10 bg-[#111c1d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option
              v-for="position in positions"
              :key="position.value"
              :value="position.value"
            >
              {{ position.label }}
            </option>
          </select>
        </div>

        <!-- OVR + Price -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-white/80">
              OVR
            </label>

            <input
              v-model="form.ovr"
              type="number"
              min="1"
              max="99"
              placeholder="85"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-white/80">
              Price
            </label>

            <input
              v-model="form.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="10.00"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20"
            />
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            :disabled="isBusy"
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="isBusy"
            class="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#111c1d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Loader2
              v-if="isBusy"
              class="mr-2 h-4 w-4 animate-spin"
            />

            {{ uploading ? 'Uploading...' : loading ? 'Adding...' : 'Add Player' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>