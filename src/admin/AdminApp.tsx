import { useEffect } from "react"

import { AdminLayout } from "@/admin/AdminLayout"
import { useSession } from "@/admin/auth"
import { AdminDataProvider } from "@/admin/data"
import { LoginPage } from "@/admin/LoginPage"
import { AccountPage } from "@/admin/pages/AccountPage"
import { Dashboard } from "@/admin/pages/Dashboard"
import { ProfilePage } from "@/admin/pages/ProfilePage"
import { ResourcePage } from "@/admin/pages/ResourcePage"
import { findResource } from "@/admin/resources"
import { ToastProvider } from "@/admin/ui"
import { usePathname } from "@/lib/router"

function Routes() {
  const path = usePathname()
  const segment = path.replace(/^\/admin\/?/, "").split("/")[0]

  if (segment === "perfil") return <ProfilePage />
  if (segment === "conta") return <AccountPage />
  const resource = findResource(segment)
  if (resource) return <ResourcePage key={resource.key} config={resource} />
  return <Dashboard />
}

export default function AdminApp() {
  const session = useSession()

  useEffect(() => {
    const prev = document.title
    document.title = "Painel | Jaqueline Ngulo"
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <ToastProvider>
      {session ? (
        <AdminDataProvider>
          <AdminLayout>
            <Routes />
          </AdminLayout>
        </AdminDataProvider>
      ) : (
        <LoginPage />
      )}
    </ToastProvider>
  )
}
