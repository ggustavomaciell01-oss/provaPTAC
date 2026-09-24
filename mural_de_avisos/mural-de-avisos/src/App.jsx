import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export default function App() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTexto, setNovoTexto] = useState('');

  const [idEditando, setIdEditando] = useState(null);
  const [tituloEditando, setTituloEditando] = useState('');
  const [textoEditando, setTextoEditando] = useState('');

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAvisos(data.slice(0, 3));
    } catch (err) {
      setError('Não foi possível conectar à API (Network Error). Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!novoTitulo || !novoTexto) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: novoTitulo, body: novoTexto, userId: 1 }),
      });
      const novoAviso = response.ok ? await response.json() : { id: Date.now(), title: novoTitulo, body: novoTexto };

      setAvisos([novoAviso, ...avisos]);
      setNovoTitulo('');
      setNovoTexto('');
    } catch {
      setAvisos([{ id: Date.now(), title: novoTitulo, body: novoTexto }, ...avisos]);
      setNovoTitulo('');
      setNovoTexto('');
    }
  };

  const handleExcluir = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setAvisos(avisos.filter(a => a.id !== id));
  };

  const handleSalvarEdicao = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: tituloEditando, body: textoEditando, userId: 1 }),
      });
    } catch (err) {}

    setAvisos(avisos.map(a => a.id === id ? { ...a, title: tituloEditando, body: textoEditando } : a));
    setIdEditando(null);
  };

  return (
    <div className="container">
      <header className="main-header">
        <h1>Mural de Avisos</h1>
      </header>

      <div className="main-grid">
        <section className="form-section">
          <h2>Novo aviso</h2>
          <form onSubmit={handleCriar}>
            <div className="form-group">
              <label>Título</label>
              <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Texto do aviso</label>
              <textarea value={novoTexto} onChange={e => setNovoTexto(e.target.value)} rows="4" />
            </div>
            <button type="submit" className="btn-primary">Publicar aviso</button>
          </form>
        </section>

        <section className="list-section">
          <h2>Avisos publicados ({avisos.length})</h2>

          {loading && <div className="status-message">Carregando avisos...</div>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <div className="cards-stack">
              {avisos.length === 0 ? (
                <div className="empty-message">Nenhum aviso por aqui. Que tal publicar o primeiro aviso no formulário ao lado?</div>
              ) : (
                avisos.map((aviso) => (
                  <div key={aviso.id} className={`card ${idEditando === aviso.id ? 'editing' : ''}`}>
                    {idEditando === aviso.id ? (
                      <div>
                        <div className="form-group">
                          <label>Título</label>
                          <input type="text" value={tituloEditando} onChange={e => setTituloEditando(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Texto do aviso</label>
                          <textarea value={textoEditando} onChange={e => setTextoEditando(e.target.value)} rows="3" />
                        </div>
                        <div className="actions-row">
                          <button onClick={() => handleSalvarEdicao(aviso.id)} className="btn-primary">Salvar</button>
                          <button onClick={() => setIdEditando(null)} className="btn-secondary">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3>{aviso.title}</h3>
                        <p>{aviso.body}</p>
                        <div className="actions-row">
                          <button onClick={() => {
                            setIdEditando(aviso.id);
                            setTituloEditando(aviso.title);
                            setTextoEditando(aviso.body);
                          }} className="btn-secondary">Editar</button>
                          <button onClick={() => handleExcluir(aviso.id)} className="btn-secondary">Excluir</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
