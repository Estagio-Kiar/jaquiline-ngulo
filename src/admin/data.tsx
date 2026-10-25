import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { api } from "@/lib/api"
import type {
  CareerHistory,
  Category,
  Episode,
  News,
  Post,
  Profile,
  SocialLink,
} from "@/lib/types"

/** Cache partilhada das listas do painel (contadores, dashboard, páginas). */

export type DataMap = {
  profile: Profile
  social: SocialLink
  career: CareerHistory
  news: News
  articles: Post
  categories: Category
  episodes: Episode
}
export type DataKey = keyof DataMap

type Slot<T> = { items: T[]; loading: boolean; error: string; loaded: boolean }
type State = { [K in DataKey]: Slot<DataMap[K]> }

const KEYS: DataKey[] = [
  "profile",
  "social",
  "career",
  "news",
  "articles",
  "categories",
  "episodes",
]

const empty = <T,>(): Slot<T> => ({
  items: [],
  loading: true,
  error: "",
  loaded: false,
})
const initial = Object.fromEntries(
  KEYS.map((k) => [k, empty()])
) as unknown as State

type Ctx = {
  state: State
  reload: (key?: DataKey) => Promise<void>
}

const DataCtx = createContext<Ctx>({ state: initial, reload: async () => {} })

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)

  const load = useCallback(async (key: DataKey) => {
    setState((s) => ({ ...s, [key]: { ...s[key], loading: true, error: "" } }))
    try {
      const items = await api[key].list()
      setState((s) => ({
        ...s,
        [key]: {
          items: Array.isArray(items) ? items : [],
          loading: false,
          error: "",
          loaded: true,
        },
      }))
    } catch (e) {
      setState((s) => ({
        ...s,
        [key]: {
          ...s[key],
          loading: false,
          error: (e as Error).message,
          loaded: true,
        },
      }))
    }
  }, [])

  const reload = useCallback(
    async (key?: DataKey) => {
      await Promise.all((key ? [key] : KEYS).map(load))
    },
    [load]
  )

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <DataCtx.Provider value={{ state, reload }}>{children}</DataCtx.Provider>
  )
}

export function useAdminData() {
  return useContext(DataCtx)
}

export function useSlot<K extends DataKey>(key: K) {
  const { state, reload } = useContext(DataCtx)
  return { ...state[key], reload: () => reload(key) }
}
