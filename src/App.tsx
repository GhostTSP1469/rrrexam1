import { useState } from 'react'
import { useAtom } from 'jotai'
import {
  BriefcaseBusiness,
  Eye,
  MapPin,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  addUser,
  deleteUser,
  editUser,
  jotaiUsersAtom,
  type RootState,
  useUserStore,
} from '@/store/store'

type TableUser = {
  id: number
  name: string
  surname: string
  age: number
  job: string
  address: string
  status: boolean
}

const inputClass =
  'h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

function App() {
  const dispatch = useDispatch()
  const reduxUsers = useSelector((state: RootState) => state.users)

  const zustandUsers = useUserStore((state) => state.users)
  const saveZustandUser = useUserStore((state) => state.saveUser)
  const deleteZustandUser = useUserStore((state) => state.deleteUser)

  const [jotaiUsers, setJotaiUsers] = useAtom(jotaiUsersAtom)

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [selectedId, setSelectedId] = useState(0)

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [age, setAge] = useState('')
  const [job, setJob] = useState('')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState(true)

  const users = reduxUsers.map((reduxUser) => {
    const zustandUser = zustandUsers.find(
      (user) => user.id === reduxUser.id,
    )
    const jotaiUser = jotaiUsers.find((user) => user.id === reduxUser.id)

    let surname = ''
    let job = ''
    let address = ''
    let status = false

    if (zustandUser) {
      surname = zustandUser.surname
      job = zustandUser.job
    }

     if (jotaiUser) {
      address = jotaiUser.address
      status = jotaiUser.status
    }

    return {
      id: reduxUser.id,
      name: reduxUser.name,
      age: reduxUser.age,
      surname,
      job,
      address,
      status,
    }
  })

  const filteredUsers = users.filter((user) => {
    const userText =
      `${user.id} ${user.name} ${user.surname} ${user.age} ${user.job} ${user.address}`.toLowerCase()

    return userText.includes(search.toLowerCase())
  })

  const selectedUser = users.find((user) => user.id === selectedId)

  function clearFields() {
    setName('')
    setSurname('')
    setAge('')
    setJob('')
    setAddress('')
    setStatus(true)
    setSelectedId(0)
  }

  function closeModal() {
    setModal('')
    clearFields()
  }

  function changeModal(open: boolean) {
    if (!open) {
      closeModal()
    }
  }

  function openAddModal() {
    clearFields()
    setModal('add')
  }

  function fillFields(user: TableUser) {
    setSelectedId(user.id)
    setName(user.name)
    setSurname(user.surname)
    setAge(String(user.age))
    setJob(user.job)
    setAddress(user.address)
    setStatus(user.status)
  }

  function openEditModal(user: TableUser) {
    fillFields(user)
    setModal('edit')
  }

  function openInfoModal(user: TableUser) {
    setSelectedId(user.id)
    setModal('info')
  }

  function openDeleteModal(user: TableUser) {
    setSelectedId(user.id)
    setModal('delete')
  }

  function saveJotaiUser(id: number) {
    const exists = jotaiUsers.find((user) => user.id === id)

    if (exists) {
      setJotaiUsers(
        jotaiUsers.map((user) => {
          if (user.id === id) {
            return { id, address, status }
          }

          return user
        }),
      )
      return
    }

    setJotaiUsers([...jotaiUsers, { id, address, status }])
  }

  function saveUser() {
    if (!name || !surname || !age || !job || !address) {
      return
    }

    let id = selectedId

    if (modal === 'add') {
      id = Date.now()
      dispatch(addUser({ id, name, age: Number(age) }))
    }

    if (modal === 'edit') {
      dispatch(editUser({ id, name, age: Number(age) }))
    }

    saveZustandUser({ id, surname, job })
    saveJotaiUser(id)
    closeModal()
  }

  function removeUser() {
    dispatch(deleteUser(selectedId))
    deleteZustandUser(selectedId)
    setJotaiUsers(jotaiUsers.filter((user) => user.id !== selectedId))
    closeModal()
  }

  function changeStatus(id: number) {
    setJotaiUsers(
      jotaiUsers.map((user) => {
        if (user.id === id) {
          return { id: user.id, address: user.address, status: !user.status }
        }

        return user
      }),
    )
  }

  function getModalTitle() {
    if (modal === 'add') return 'Add user'
    if (modal === 'edit') return 'Edit user'
    if (modal === 'info') return 'User details'
    return 'Delete user'
  }

  function getDialogClass() {
    if (modal === 'info') {
      return 'info-dialog-glitch border-cyan-400/70 bg-slate-950 text-white shadow-[0_0_35px_rgba(34,211,238,0.3)]'
    }

    return 'border-slate-200 bg-white text-slate-900 shadow-xl'
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                User list
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {filteredUsers.length} количество пользователей
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-72"
                placeholder="Search...."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Button
              className="group relative h-11 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-blue-600 to-blue-800 px-6 text-base text-white shadow-[0_2px_5px_rgba(0,0,0,0.2),0_5px_15px_rgba(41,98,255,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-full before:bg-gradient-to-b before:from-white/20 before:to-white/5 after:absolute after:-left-full after:top-0 after:h-full after:w-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-all after:duration-500 hover:scale-[1.03] hover:tracking-wide hover:shadow-[0_8px_25px_rgba(41,98,255,0.35),0_0_20px_rgba(41,98,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:after:left-full active:translate-y-0.5 active:scale-95"
              onClick={openAddModal}
            >
              <span className="relative z-10">Add user</span>
              <span className="absolute bottom-0 left-0 z-10 h-[3px] w-0 bg-white/80 transition-all duration-500 group-hover:w-full" />
            </Button>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">ID</th>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Surname</th>
                  <th className="px-5 py-4 font-semibold">Age</th>
                  <th className="px-5 py-4 font-semibold">Job</th>
                  <th className="px-5 py-4 font-semibold">Address</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    className="transition-colors hover:bg-slate-50"
                    key={user.id}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {user.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {user.surname}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.age}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {user.job}
                      </span>
                    </td>
                    <td className="max-w-60 px-5 py-4 text-slate-600">
                      {user.address}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          className="peer sr-only"
                          checked={user.status}
                          id={`status-${user.id}`}
                          type="checkbox"
                          onChange={() => changeStatus(user.id)}
                        />
                        <label
                          className="relative inline-block h-8 w-[70px] cursor-pointer rounded-full bg-red-500 shadow-[inset_0_8px_16px_rgba(0,0,0,0.35),0_-1px_0_rgba(0,0,0,0.2),inset_0_-1px_0_#fff] transition-all duration-500 before:absolute before:left-1 before:top-1 before:z-10 before:size-6 before:rounded-full before:bg-white/20 before:shadow-[inset_0_-4px_18px_#500,0_7px_12px_rgba(0,0,0,0.35)] before:transition-all before:duration-500 peer-checked:bg-green-500 peer-checked:before:translate-x-[38px] peer-checked:before:shadow-[inset_0_-4px_18px_#050,0_7px_12px_rgba(0,0,0,0.35)]"
                          htmlFor={`status-${user.id}`}
                        >
                          
                        </label>
                        <span className="text-xs font-medium text-slate-600">
                          {user.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label="User info"
                          className="info-glitch group relative overflow-visible rounded-md border border-slate-300 bg-slate-900 text-white shadow-sm transition-all hover:border-cyan-400 hover:bg-slate-900 hover:text-white hover:shadow-[0_8px_10px_-8px_rgb(0,255,213)]"
                          size="icon"
                          onClick={() => openInfoModal(user)}
                        >
                          <Eye className="relative z-10 transition-all group-hover:[filter:drop-shadow(-1px_-1px_0_#1df2f0)_drop-shadow(1px_1px_0_#e94be8)]" />
                        </Button>
                        <Button
                          aria-label="Edit user"
                          className="group relative isolate overflow-hidden rounded-xl border-0 bg-yellow-400 text-white shadow-[0_4px_8px_rgba(0,0,0,0.14)] transition-all duration-300 before:absolute before:z-[-1] before:size-16 before:scale-0 before:rounded-full before:bg-indigo-400 before:blur-md before:transition-transform before:duration-300 after:absolute after:bottom-2 after:left-0 after:z-[-1] after:h-0.5 after:w-5 after:origin-left after:scale-x-0 after:rounded-full after:bg-white after:transition-transform after:duration-500 hover:text-white hover:shadow-[0_5px_10px_rgba(0,0,0,0.34)] hover:before:scale-100 hover:after:scale-x-100"
                          size="icon"
                          onClick={() => openEditModal(user)}
                        >
                          <svg
                            className="relative z-10 origin-bottom fill-current transition-transform duration-200 group-hover:translate-x-1 group-hover:-rotate-[15deg]"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                          </svg>
                        </Button>
                        <Button
                          aria-label="Delete user"
                          className="group flex size-8 flex-col gap-0.5 overflow-hidden rounded-full bg-slate-900 text-white shadow-sm transition-all duration-300 hover:gap-0 hover:bg-red-500 hover:text-white"
                          size="icon"
                          onClick={() => openDeleteModal(user)}
                        >
                          <svg
                            className="w-3 origin-bottom-right transition-transform duration-300 group-hover:rotate-[160deg]"
                            fill="none"
                            viewBox="0 0 69 14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              className="fill-current"
                              d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734Z"
                            />
                          </svg>
                          <svg
                            className="w-3 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 69 57"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              className="fill-current"
                              d="M64.0023 1.0648C64.0397.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                            />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-16 text-center">
              <Search className="mx-auto mb-3 text-slate-300" size={34} />
              <p className="font-medium text-slate-700">Not  found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search request.
              </p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={modal !== ''} onOpenChange={changeModal}>
        <DialogContent
          className={`border p-0 sm:max-w-lg ${getDialogClass()}`}
        >
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle
                className={`text-xl font-semibold ${modal === 'info' ? 'info-dialog-title' : ''}`}
                data-text={getModalTitle()}
              >
                {getModalTitle()}
              </DialogTitle>
              <DialogDescription
                className={modal === 'info' ? 'text-cyan-100/70' : 'text-slate-500'}
              >
                {modal === 'info'
                  ? 'information about user'
                  : 'Review the information before continuing.'}
              </DialogDescription>
            </DialogHeader>

            {(modal === 'add' || modal === 'edit') && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Name
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Surname
                  <input
                    className={inputClass}
                    value={surname}
                    onChange={(event) => setSurname(event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Age
                  <input
                    className={inputClass}
                    placeholder="Enter age"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Job
                  <input
                    className={inputClass}
                    value={job}
                    onChange={(event) => setJob(event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                  Address
                  <input
                    className={inputClass}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium sm:col-span-2">
                  <input
                    checked={status}
                    type="checkbox"
                    onChange={(event) => setStatus(event.target.checked)}
                  />
                  User is active
                </label>
              </div>
            )}

            {modal === 'info' && selectedUser && (
              <div className="grid gap-3">
                <InfoRow
                  icon={<UserRound size={18} />}
                  label="Full name"
                  value={`${selectedUser.name} ${selectedUser.surname}`}
                />
                <InfoRow
                  icon={<BriefcaseBusiness size={18} />}
                  label="Age and job"
                  value={`${selectedUser.age} years, ${selectedUser.job}`}
                />
                <InfoRow
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={selectedUser.address}
                />
                <InfoRow
                  icon={<UsersRound size={18} />}
                  label="Status"
                  value={selectedUser.status ? 'Active' : 'Inactive'}
                />
              </div>
            )}

            {modal === 'delete' && selectedUser && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="font-medium text-red-900">
                  Delete {selectedUser.name} {selectedUser.surname}?
                </p>
                <p className="mt-1 text-sm leading-6 text-red-700">
                 are you sure?
                </p>
              </div>
            )}

            <DialogFooter
              className={`mx-0 -mb-6 mt-6 px-0 pb-0 ${
                modal === 'info'
                  ? 'border-cyan-400/20 bg-transparent'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <Button
                className={`transition-colors hover:border-red-500 hover:bg-red-600 hover:text-white ${
                  modal === 'info'
                    ? 'border-cyan-400/30 bg-white/5 text-cyan-100'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
                variant="outline"
                onClick={closeModal}
              >
                Cancel
              </Button>

              {(modal === 'add' || modal === 'edit') && (
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={saveUser}
                >
                  Save user
                </Button>
              )}

              {modal === 'delete' && (
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={removeUser}
                >
                  Delete user
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function InfoRow(props: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="info-dialog-row flex gap-3 rounded-xl border border-cyan-400/20 bg-white/5 p-4 transition-all">
      <span className="mt-0.5 text-cyan-300">{props.icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-100/50">
          {props.label}
        </p>
        <p className="mt-1 font-medium text-white">{props.value}</p>
      </div>
    </div>
  )
}

export default App
