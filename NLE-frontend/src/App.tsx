import { HomePage } from './pages/Home/HomePage';
import { useProducts } from './hooks/useProducts';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();
  const { categories } = useProducts();

  return (
    <HomePage
      categories={categories}
      onSelectCategory={(cat, sub) => {
        if (sub && sub !== '__all__') {
          navigate(`/category/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}`);
        } else {
          navigate(`/category/${encodeURIComponent(cat)}`);
        }
      }}
      onViewProduct={(p) => navigate(`/product/${p._id}`)}
      onBookProduct={(p) => navigate(`/booking/${p._id}`)}
    />
  );
}
