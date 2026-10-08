import { useState, useEffect } from 'react'
import './App.css'

const initialTasks = [
  {
    id: 1,
    title: 'Desain Logo Sederhana',
    description: 'Membuat logo untuk UMKM dengan 2 konsep',
    budget: 150000,
    deadline: '3 hari',
    category: 'Desain',
    status: 'tersedia'
  },
  {
    id: 2,
    title: 'Input Data Excel',
    description: 'Input 200 baris data pelanggan ke spreadsheet',
    budget: 75000,
    deadline: '1 hari',
    category: 'Data Entry',
    status: 'tersedia'
  },
  {
    id: 3,
    title: 'Copywriting Produk',
    description: 'Menulis deskripsi produk untuk 10 item toko online',
    budget: 120000,
    deadline: '2 hari',
    category: 'Penulisan',
    status: 'tersedia'
  },
  {
    id: 4,
    title: 'Edit Video Pendek',
    description: 'Edit video 30-60 detik untuk Instagram Reels',
    budget: 200000,
    deadline: '2 hari',
    category: 'Video',
    status: 'tersedia'
  }
]

function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const [tasks, setTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [activeTab, setActiveTab] = useState('tersedia')

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'Umum'
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('freelance_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      loadUserTasks(parsedUser.email)
    }

    const savedTasks = localStorage.getItem('freelance_all_tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      setTasks(initialTasks)
      localStorage.setItem('freelance_all_tasks', JSON.stringify(initialTasks))
    }
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('freelance_all_tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const loadUserTasks = (email) => {
    const allUserTasks = JSON.parse(localStorage.getItem('freelance_user_tasks') || '{}')
    setMyTasks(allUserTasks[email] || [])
  }

  const saveUserTasks = (email, updatedTasks) => {
    const allUserTasks = JSON.parse(localStorage.getItem('freelance_user_tasks') || '{}')
    allUserTasks[email] = updatedTasks
    localStorage.setItem('freelance_user_tasks', JSON.stringify(allUserTasks))
    setMyTasks(updatedTasks)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRegister = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Semua field harus diisi')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    const users = JSON.parse(localStorage.getItem('freelance_users') || '[]')
    if (users.find(u => u.email === form.email)) {
      setError('Email sudah terdaftar')
      return
    }

    const newUser = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.email === 'admin@taskfreelancer.com' ? 'admin' : 'user'
    }

    users.push(newUser)
    localStorage.setItem('freelance_users', JSON.stringify(users))
    localStorage.setItem('freelance_user', JSON.stringify(newUser))
    setUser(newUser)
    setForm({ name: '', email: '', password: '' })
    loadUserTasks(newUser.email)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('freelance_users') || '[]')
    const found = users.find(
      u => u.email === form.email && u.password === form.password
    )

    if (!found) {
      setError('Email atau password salah')
      return
    }

    localStorage.setItem('freelance_user', JSON.stringify(found))
    setUser(found)
    setForm({ name: '', email: '', password: '' })
    loadUserTasks(found.email)
  }

  const handleLogout = () => {
    localStorage.removeItem('freelance_user')
    setUser(null)
    setMyTasks([])
    setActiveTab('tersedia')
  }

  const ambilTugas = (task) => {
    const updatedAvailable = tasks.filter(t => t.id !== task.id)
    setTasks(updatedAvailable)

    const takenTask = { ...task, status: 'dikerjakan', takenAt: new Date().toISOString() }
    const updatedMyTasks = [...myTasks, takenTask]
    saveUserTasks(user.email, updatedMyTasks)
  }

  const selesaikanTugas = (id) => {
    const updated = myTasks.map(t =>
      t.id === id ? { ...t, status: 'selesai', completedAt: new Date().toISOString() } : t
    )
    saveUserTasks(user.email, updated)
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.description || !newTask.budget || !newTask.deadline) {
      alert('Semua field harus diisi')
      return
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      budget: Number(newTask.budget),
      deadline: newTask.deadline,
      category: newTask.category,
      status: 'tersedia'
    }

    setTasks([task, ...tasks])
    setNewTask({ title: '', description: '', budget: '', deadline: '', category: 'Umum' })
    alert('Tugas berhasil ditambahkan!')
  }

  const totalPendapatan = myTasks
    .filter(t => t.status === 'selesai')
    .reduce((sum, t) => sum + t.budget, 0)

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@taskfreelancer.com'

  if (!user) {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>TaskFreelancer</h1>
          <p className="auth-subtitle">
            {authMode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}
          </p>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
            {authMode === 'register' && (
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama kamu"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn-primary">
              {authMode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <p className="switch-auth">
            {authMode === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button type="button" onClick={() => { setAuthMode('register'); setError('') }}>
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button type="button" onClick={() => { setAuthMode('login'); setError('') }}>
                  Masuk
                </button>
              </>
            )}
          </p>

          <p className="admin-hint">
            Tip: Daftar dengan email <strong>admin@taskfreelancer.com</strong> untuk jadi admin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>TaskFreelancer</h1>
          <button className="btn-logout" onClick={handleLogout}>Keluar</button>
        </div>
        <p>Halo, {user.name} {isAdmin && <span className="badge-admin">Admin</span>}</p>
      </header>

      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Tugas Selesai</span>
          <span className="stat-value">
            {myTasks.filter(t => t.status === 'selesai').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pendapatan</span>
          <span className="stat-value">
            Rp {totalPendapatan.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'tersedia' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('tersedia')}
        >
          Tugas
        </button>
        <button
          className={activeTab === 'saya' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('saya')}
        >
          Saya ({myTasks.length})
        </button>
        <button
          className={activeTab === 'profil' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('profil')}
        >
          Profil
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'admin' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        )}
      </div>

      <main className="task-list">
        {activeTab === 'tersedia' && (
          tasks.length === 0 ? (
            <p className="empty">Tidak ada tugas tersedia.</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <span className="category">{task.category}</span>
                  <span className="budget">Rp {task.budget.toLocaleString('id-ID')}</span>
                </div>
                <h3>{task.title}</h3>
                <p className="description">{task.description}</p>
                <div className="task-footer">
                  <span className="deadline">⏱ {task.deadline}</span>
                  <button className="btn-ambil" onClick={() => ambilTugas(task)}>
                    Ambil Tugas
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'saya' && (
          myTasks.length === 0 ? (
            <p className="empty">Kamu belum mengambil tugas.</p>
          ) : (
            myTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <span className="category">{task.category}</span>
                  <span className={`status ${task.status}`}>
                    {task.status === 'dikerjakan' ? 'Sedang Dikerjakan' : 'Selesai'}
                  </span>
                </div>
                <h3>{task.title}</h3>
                <p className="description">{task.description}</p>
                <div className="task-footer">
                  <span className="budget">Rp {task.budget.toLocaleString('id-ID')}</span>
                  {task.status === 'dikerjakan' && (
                    <button className="btn-selesai" onClick={() => selesaikanTugas(task.id)}>
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'profil' && (
          <div className="profile-card">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            {isAdmin && <span className="badge-admin">Administrator</span>}

            <div className="profile-stats">
              <div>
                <strong>{myTasks.length}</strong>
                <span>Total Tugas</span>
              </div>
              <div>
                <strong>{myTasks.filter(t => t.status === 'selesai').length}</strong>
                <span>Selesai</span>
              </div>
              <div>
                <strong>Rp {totalPendapatan.toLocaleString('id-ID')}</strong>
                <span>Pendapatan</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="admin-form-card">
            <h3>Tambah Tugas Baru</h3>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Judul Tugas</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Contoh: Desain Banner"
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Jelaskan detail tugas..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (Rp)</label>
                  <input
                    type="number"
                    value={newTask.budget}
                    onChange={e => setNewTask({ ...newTask, budget: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="text"
                    value={newTask.deadline}
                    onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                    placeholder="2 hari"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select
                  value={newTask.category}
                  onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                >
                  <option value="Umum">Umum</option>
                  <option value="Desain">Desain</option>
                  <option value="Penulisan">Penulisan</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="Video">Video</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                Tambah Tugas
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>TaskFreelancer — Platform tugas freelancer</p>
      </footer>
    </div>
  )
}

export default App