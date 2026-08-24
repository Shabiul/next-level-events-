import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { BookingWizard } from '../../components/booking/BookingWizard';
import { LoadingState, EmptyState } from '../../components/ui/EmptyState';
import type { AdminProduct, BookingAddonSnapshot, BookingDetails } from '../../types';
import { getApiUrl } from '../../services/api.service';

interface BookingPageRouteProps {
  onConfirmBooking?: (product: AdminProduct, details: BookingDetails, method: 'razorpay' | 'whatsapp') => void;
}

export const BookingPage: React.FC<BookingPageRouteProps> = ({ onConfirmBooking }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();

  const stateProduct = (location.state as any)?.product as AdminProduct | undefined;
  const preferredMethod = (location.state as any)?.preferredMethod || 'razorpay';
  const selectedAddOns: BookingAddonSnapshot[] = (location.state as any)?.selectedAddOns || [];

  const [product, setProduct] = useState<AdminProduct | null>(stateProduct || null);
  const [loading, setLoading] = useState(!stateProduct);

  useEffect(() => {
    if (stateProduct) {
      setProduct(stateProduct);
      setLoading(false);
      return;
    }

    if (!id) {
      if (products.length > 0) {
        setProduct(products[0]);
        setLoading(false);
      } else if (!productsLoading) {
        setLoading(false);
      }
      return;
    }

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
        if (products.length > 0) {
          setProduct(products[0]);
        } else {
          setProduct(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, products, productsLoading, stateProduct]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingState label="Preparing booking checkout..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 py-16 text-center">
        <EmptyState
          title="No package selected"
          description="Please select an experience to proceed with booking."
          actionLabel="Explore Packages"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const handleConfirm = (
    p: AdminProduct,
    details: BookingDetails,
    method: 'razorpay' | 'whatsapp'
  ) => {
    if (onConfirmBooking) {
      onConfirmBooking(p, details, method);
    }
  };

  return (
    <BookingWizard
      product={product}
      preferredMethod={preferredMethod}
      selectedAddOns={selectedAddOns}
      onBack={() => navigate(-1)}
      onConfirm={handleConfirm}
    />
  );
};
