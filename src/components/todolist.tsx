import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
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
  accessAtom,
  addUser,
  deleteUser,
  editUser,
  type RootState,
  useWorkStore,
} from '../store/store'

const firstAddresses = [
  { id: 1, address: 'New York, 5th Avenue' },
  { id: 2, address: 'London, Baker Street' },
  { id: 3, address: 'Berlin, Alexanderplatz' },
]

function getAddresses() {
  const savedAddresses = localStorage.getItem('addresses')

  if (savedAddresses) {
    return JSON.parse(savedAddresses)
  }

  return firstAddresses
}

function Todolist() {
  const dispatch = useDispatch()
  const reduxUsers = useSelector((state: RootState) => state.users)

  const works = useWorkStore((state) => state.works)
  const saveWork = useWorkStore((state) => state.saveWork)
  const deleteWork = useWorkStore((state) => state.deleteWork)

  const [accesses, setAccesses] = useAtom(accessAtom)
  const [addresses, setAddresses] = useState(getAddresses)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(0)

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [age, setAge] = useState('')
  const [job, setJob] = useState('')
  const [status, setStatus] = useState(true)
  const [role, setRole] = useState('Viewer')
  const [address, setAddress] = useState('')

  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses))
  }, [addresses])

  const users = reduxUsers.map((user) => {
    const work = works.find((item) => item.id === user.id)
    const access = accesses.find((item) => item.id === user.id)
    const userAddress = addresses.find((item) => item.id === user.id)

    let age = 0
    let job = ''
    let status = false
    let role = ''
    let address = ''

    if (work) {
      age = work.age
      job = work.job
    }

    if (access) {
      status = access.status
      role = access.role
    }

    if (userAddress) {
      address = userAddress.address
    }

    return {
      ...user,
      age,
      job,
      status,
      role,
      address,
    }
  })

  const filteredUsers = users.filter((user) => {
    const text =
      `${user.name} ${user.surname} ${user.job} ${user.role} ${user.address}`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  function clearForm() {
    setName('')
    setSurname('')
    setAge('')
    setJob('')
    setStatus(true)
    setRole('Viewer')
    setAddress('')
    setEditId(0)
  }

  function openAddModal() {
    clearForm()
    setModalOpen(true)
  }

  function openEditModal(id: number) {
    const user = users.find((item) => item.id === id)
    if (!user) return

    setEditId(id)
    setName(user.name)
    setSurname(user.surname)
    setAge(String(user.age))
    setJob(user.job)
    setStatus(user.status)
    setRole(user.role)
    setAddress(user.address)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    clearForm()
  }

  function changeModal(open: boolean) {
    if (open) {
      setModalOpen(true)
      return
    }

    closeModal()
  }

  function saveUser() {
    if (!name || !surname || !age || !job || !address) {
      return
    }

    const id = editId || Date.now()
    const userData = { id, name, surname }

    if (editId) {
      dispatch(editUser(userData))
    } else {
      dispatch(addUser(userData))
    }

    saveWork({ id, age: Number(age), job })

    const accessExists = accesses.find((item) => item.id === id)
    if (accessExists) {
      setAccesses(
        accesses.map((item) => {
          if (item.id === id) {
            return { id, status, role }
          }

          return item
        }),
      )
    } else {
      setAccesses([...accesses, { id, status, role }])
    }

    const addressExists = addresses.find((item) => item.id === id)
    if (addressExists) {
      setAddresses(
        addresses.map((item) => {
          if (item.id === id) {
            return { id, address }
          }

          return item
        }),
      )
    } else {
      setAddresses([...addresses, { id, address }])
    }

    closeModal()
  }

  function removeUser(id: number) {
    dispatch(deleteUser(id))
    deleteWork(id)
    setAccesses(accesses.filter((item) => item.id !== id))
    setAddresses(addresses.filter((item) => item.id !== id))
  }

  function changeStatus(id: number) {
    setAccesses(
      accesses.map((item) => {
        if (item.id === id) {
          return { ...item, status: !item.status }
        }

        return item
      }),
    )
  }

  function getStatusText(userStatus: boolean) {
    if (userStatus) {
      return 'Active'
    }

    return 'Inactive'
  }

  function getModalTitle() {
    if (editId) {
      return 'Edit user'
    }

    return 'Add user'
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Userlist </h1>
            <p className="mt-2 text-sm text-slate-400">
              Found {filteredUsers.length} users
            </p>
          </div>

          <div className="flex gap-3">
            <input
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none"
              value={search}
              placeholder="Search..."
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="group relative cursor-pointer overflow-hidden border-2 border-green-500 px-8 py-2"
              onClick={openAddModal}
            >
              <span className="relative z-10 text-xl font-bold text-white duration-500 group-hover:text-green-500">
                Add user
              </span>
              <span className="absolute left-0 top-0 h-full w-full bg-green-500 duration-500 group-hover:-translate-x-full" />
              <span className="absolute left-0 top-0 h-full w-full bg-green-500 duration-500 group-hover:translate-x-full" />
              <span className="absolute left-0 top-0 h-full w-full bg-green-500 delay-300 duration-500 group-hover:-translate-y-full" />
              <span className="absolute left-0 top-0 h-full w-full bg-green-500 delay-300 duration-500 group-hover:translate-y-full" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-4">Name / Surname</th>
                <th className="p-4">Age / Job</th>
                <th className="p-4">Status</th>
                <th className="p-4">Role</th>
                <th className="p-4">Address</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr className="border-t border-white/10" key={user.id}>
                  <td className="p-4 font-bold">
                    {user.name} {user.surname}
                  </td>
                  <td className="p-4">
                    {user.age} · {user.job}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <label className="status-checkbox">
                        <input
                          type="checkbox"
                          checked={user.status}
                          onChange={() => changeStatus(user.id)}
                        />
                        <span className="status-checkmark" />
                      </label>
                      <span>{getStatusText(user.status)}</span>
                    </div>
                  </td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">{user.address}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all delay-75 duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-blue-700 active:scale-95"
                        onClick={() => openEditModal(user.id)}
                      >
                        <svg
                          className="mr-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="relative isolate overflow-hidden rounded-full bg-white px-8 py-2 text-base font-bold text-black shadow-md transition-all duration-400 ease-in-out before:absolute before:left-[-100%] before:top-0 before:-z-10 before:h-full before:w-full before:rounded-full before:bg-gradient-to-r before:from-red-500 before:to-red-300 before:transition-all before:duration-500 before:ease-in-out hover:scale-105 hover:text-white hover:shadow-lg hover:before:left-0 active:scale-90"
                        onClick={() => removeUser(user.id)}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={modalOpen} onOpenChange={changeModal}>
        <DialogContent className="border border-white/10 bg-slate-900 p-0 text-slate-100 shadow-2xl shadow-black/50 sm:max-w-xl">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-2xl font-bold">
                {getModalTitle()}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill in the user information and press save.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
              <input placeholder="Surname" value={surname} onChange={(event) => setSurname(event.target.value)} />
              <input type="number" placeholder="Age" value={age} onChange={(event) => setAge(event.target.value)} />
              <input placeholder="Job" value={job} onChange={(event) => setJob(event.target.value)} />
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={status} onChange={(event) => setStatus(event.target.checked)} />
                Active
              </label>
              <input className="sm:col-span-2" placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>

            <DialogFooter className="mx-0 -mb-6 mt-6 border-white/10 bg-white/5 px-0 pb-0">
              <Button className="text-slate-300" type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button className="bg-violet-600 px-5 text-white hover:bg-violet-500" onClick={saveUser}>
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Todolist
