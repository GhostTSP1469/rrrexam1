import { configureStore, createSlice } from '@reduxjs/toolkit'
import { atomWithStorage } from 'jotai/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type User = {
  id: number
  name: string
  surname: string
}

export type Work = {
  id: number
  age: number
  job: string
}

export type Access = {
  id: number
  status: boolean
  role: string
}

export type RootState = {
  users: User[]
}

const firstUsers: User[] = [
  { id: 1, name: 'John', surname: 'Doe' },
  { id: 2, name: 'Jane', surname: 'Smith' },
  { id: 3, name: 'Alex', surname: 'Morgan' },
]

function getUsers() {
  const savedUsers = localStorage.getItem('users')

  if (savedUsers) {
    return JSON.parse(savedUsers)
  }

  return firstUsers
}

const usersSlice = createSlice({
  name: 'users',
  initialState: getUsers(),
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
  localStorage.setItem('users', JSON.stringify(store.getState().users))
})

const firstWorks: Work[] = [
  { id: 1, age: 30, job: 'Frontend Developer' },
  { id: 2, age: 27, job: 'UI Designer' },
  { id: 3, age: 35, job: 'Project Manager' },
]

export const useWorkStore = create(
  persist(
    (set) => ({
      works: firstWorks,

      saveWork: (newWork: Work) =>
        set((state) => {
          const workExists = state.works.find(
            (work) => work.id === newWork.id,
          )

          if (workExists) {
            return {
              works: state.works.map((work) => {
                if (work.id === newWork.id) {
                  return newWork
                }

                return work
              }),
            }
          }

          return { works: [...state.works, newWork] }
        }),

      deleteWork: (id: number) =>
        set((state) => ({
          works: state.works.filter((work) => work.id !== id),
        })),
    }),
    {
      name: 'works',
    },
  ),
)

const firstAccesses: Access[] = [
  { id: 1, status: true, role: 'Admin' },
  { id: 2, status: true, role: 'Editor' },
  { id: 3, status: false, role: 'Viewer' },
]

export const accessAtom = atomWithStorage('accesses', firstAccesses)
