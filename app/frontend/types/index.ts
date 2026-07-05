import type { User, Workspace } from "@/types/generated"

export type FlashData = {
  notice?: string
  alert?: string
  success?: string
  error?: string
}

export type SharedProps = {
  flash: FlashData
  currentUser?: User
  currentWorkspace?: Workspace
  workspaces?: Workspace[]
  authRoutes?: {
    login: string
    logout: string
  }
}

export * from "@/types/generated"
