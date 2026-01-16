import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your admin account and preferences</p>
      <SettingsForm />
    </div>
  )
}
