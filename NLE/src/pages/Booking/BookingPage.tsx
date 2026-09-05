import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { BookingWizard } from '../../components/booking/BookingWizard';
import { LoadingState, EmptyState } from '../../components/ui/EmptyState';
import type { AdminProduct, BookingAddonSnapshot, BookingDetails, CartItem } from '../../types';
import { getApiUrl } from '../../services/api.service';
import { EVENT_PACKAGES, PACKAGE_IMAGES } from '../../components/packages/eventPackages.data';

interface BookingPageRouteProps {
  onConfirmBooking?: (product: AdminProduct, details: BookingDetails, method: 'razorpay' | 'whatsapp') => void;
}

export const BookingPage: React.FC<BookingPageRouteProps> = ({ onConfirmBooking }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();

  const stateProduct = (location.state as any)?.product as AdminProduct | undefined;
  const cartItems = (location.state as any)?.cartItems as CartItem[] | undefined;
  const preferredMethod = (location.state as any)?.preferredMethod || 'razorpay';
  const selectedAddOns: BookingAddonSnapshot[] = (location.state as any)?.selectedAddOns || [];

  const initialProduct = stateProduct || (cartItems && cartItems.length > 0 ? (cartItems[0] as unknown as AdminProduct) : null);
  const [product, setProduct] = useState<AdminProduct | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct && Boolean(id));

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    if (!id) {
      // No product in state and no :id in the route -- never guess by
      // falling back to an arbitrary catalog product (that silently booked
      // the wrong package). Show "No package selected" instead.
      if (!productsLoading) setLoading(false);
      return;
    }

    const found = products.find((p: AdminProduct) => p._id === id || p.name.toLowerCase() === id.toLowerCase());
    if (found) {
      setProduct(found);
      setLoading(false);
      return;
    }

    const pkgMatch = EVENT_PACKAGES.find(
      (pkg) => pkg.id === id || pkg.name.toLowerCase() === id.toLowerCase()
    );
    if (pkgMatch) {
      setProduct({
        _id: pkgMatch.id,
        name: pkgMatch.name,
        categoryId: 'event-packages',
        categoryName: 'Event Packages',
        subcategory: 'Packages',
        price: pkgMatch.numericPrice,
        description: pkgMatch.description,
        image: PACKAGE_IMAGES[pkgMatch.id] || '/exploreee.jpg',
        moreImages: [],
        badgeColor: 'purple',
        rating: 5,
        reviewCount: 24,
        inclusions: pkgMatch.categories.flatMap((c) => c.items.map((i) => i.label)),
        addOns: [],
        active: true,
        featured: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });
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
        // The requested product genuinely doesn't exist / isn't active --
        // never substitute a different, unrelated catalog product here.
        setProduct(null);
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
      cartItems={cartItems}
      preferredMethod={preferredMethod}
      selectedAddOns={selectedAddOns}
      onBack={() => navigate(-1)}
      onConfirm={handleConfirm}
    />
  );
};
