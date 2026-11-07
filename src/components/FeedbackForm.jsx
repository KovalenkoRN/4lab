import FeedbackForm from './components/FeedbackForm';

function App() {
  return (
    <div style={{ padding: '20px', background: '#111', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px' }}>
        Форма обратной связи
      </h1>
      <FeedbackForm />
    </div>
  );
}

export default App;