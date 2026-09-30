<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="h-screen min-w-screen bg-gray-100 flex items-center justify-center px-4">
        <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900">
                    Fantasy Football
                </h1>
                <p class="mt-2 text-sm text-gray-500">
                    Sign in to your admin account
                </p>
            </div>
            <form class="space-y-5">
                <div>
                    <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
                        Email
                    </label>

                    <input id="email" type="email" placeholder="Enter your email"
                        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10" />
                </div>

                <div>
                    <label for="password" class="mb-2 block text-sm font-medium text-gray-700">
                        Password
                    </label>

                    <input id="password" type="password" placeholder="Enter your password"
                        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10" />
                </div>

                <button type="submit"
                    class="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
                    Login
                </button>

            </form>
        </div>
    </div>
</template>