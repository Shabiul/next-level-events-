import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductDetailView } from '../../components/product/ProductDetailView';
import { LoadingState, EmptyState } from '../../components/ui/EmptyState';
import type { AdminProduct, BookingAddonSnapshot } from '../../types';
import { getApiUrl } from '../../services/api.service';

interface ProductPageProps {
  onBookProduct?: (product: AdminProduct, method?: 'razorpay' | 'whatsapp', selectedAddOns?: BookingAddonSnapshot[]) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onBookProduct }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, loading: productsLoading } = useProducts();

  const stateProduct = (location.state as any)?.product as AdminProduct | undefined;
  const [product, setProduct] = useState<AdminProduct | null>(stateProduct || null);
  const [loading, setLoading] = useState(!stateProduct);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (stateProduct && stateProduct._id === id) {
      setProduct(stateProduct);
      setLoading(false);
      return;
    }

    if (!id) return;
    const found = products.find((p: AdminProduct) => p._id === id || p.name.toLowerCase() === id.toLowerCase());
    if (found) {
      setProduct(found);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(getApiUrl(`/api/products/${id}`))
      .then(async (res) => {
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, products, stateProduct]);

  if (loading || (productsLoading && !product)) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingState label="Loading package details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 py-16 text-center">
        <EmptyState
          title="Package not found"
          description="The decoration package you are looking for may have been retired or moved."
          actionLabel="Explore All Packages"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const handleBook = (
    p: AdminProduct,
    method?: 'razorpay' | 'whatsapp',
    selectedAddOns?: BookingAddonSnapshot[]
  ) => {
    if (onBookProduct) {
      onBookProduct(p, method, selectedAddOns);
    } else {
      navigate(`/booking/${p._id}`, { state: { product: p, preferredMethod: method, selectedAddOns } });
    }
  };

  return (
    <ProductDetailView
      product={product}
      onBack={() => navigate(-1)}
      onBook={handleBook}
    />
  );
};
