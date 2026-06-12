import { configureStore, createSlice } from '@reduxjs/toolkit'
import { atomWithStorage } from 'jotai/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReduxUser = {
  id: number
  name: string
  age: number
}

export type ZustandUser = {
  id: number
  surname: string
  job: string
}

export type JotaiUser = {
  id: number
  address: string
  status: boolean
}

export type RootState = {
  users: ReduxUser[]
}

const firstReduxUsers: ReduxUser[] = [
  { id: 1, name: 'Amelia', age: 28 },
  { id: 2, name: 'Noah', age: 34 },
  { id: 3, name: 'Mia', age: 25 },
  { id: 4, name: 'Ethan', age: 31 },
]

function getReduxUsers() {
  const savedUsers = localStorage.getItem('rrexp2-redux-users')

  if (savedUsers) {
    return JSON.parse(savedUsers)
  }

  return firstReduxUsers
}

const usersSlice = createSlice({
  name: 'users',
  initialState: getReduxUsers(),
  reducers: {
    addUser: (state, action) => {
      state.push(action.payload)
    },
    editUser: (state, action) => {
      return state.map((user) => {
        if (user.id === action.payload.id) {
          return action.payload
        }

        return user
      })
    },
    deleteUser: (state, action) => {
      return state.filter((user) => user.id !== action.payload)
    },
  },
})

export const { addUser, editUser, deleteUser } = usersSlice.actions

export const store = configureStore({
  reducer: {
    users: usersSlice.reducer,
  },
})

store.subscribe(() => {
  localStorage.setItem(
    'rrexp2-redux-users',
    JSON.stringify(store.getState().users),
  )
})

const firstZustandUsers: ZustandUser[] = [
  { id: 1, surname: 'Hart', job: 'Product Designer' },
  { id: 2, surname: 'Bennett', job: 'Frontend Developer' },
  { id: 3, surname: 'Carter', job: 'QA Engineer' },
  { id: 4, surname: 'Turner', job: 'Project Manager' },
]

export const useUserStore = create(
  persist(
    (set) => ({
      users: firstZustandUsers,

      saveUser: (newUser: ZustandUser) =>
        set((state) => {
          const exists = state.users.find((user) => user.id === newUser.id)
 
          if (exists) {
            return {
              users: state.users.map((user) => {
                if (user.id === newUser.id) {
                  return newUser
                }

                return user
              }),
            }
          }

          return { users: [...state.users, newUser] }
        }),

      deleteUser: (id: number) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),
    }),
    {
      name: 'rrexp2-zustand-users',
    },
  ),
)

const firstJotaiUsers: JotaiUser[] = [
  { id: 1, address: '12 Oxford Street, London', status: true },
  { id: 2, address: '44 King Street, Manchester', status: true },
  { id: 3, address: '8 Market Lane, Bristol', status: false },
  { id: 4, address: '21 Queen Road, Leeds', status: true },
]

export const jotaiUsersAtom = atomWithStorage(
  'rrexp2-jotai-users',
  firstJotaiUsers,
)
