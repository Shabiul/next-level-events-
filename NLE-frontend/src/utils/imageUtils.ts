export function resolveProductCardImage(product: {
  name?: string;
  subcategory?: string;
  categoryName?: string;
  image?: string;
}, isLanding?: boolean): string {
  const name = (product.name || '').toLowerCase();
  const sub = (product.subcategory || '').toLowerCase();
  const cat = (product.categoryName || '').toLowerCase();

  // Ice Gola Counter
  if (name.includes('ice gola') || sub.includes('ice gola') || name.includes('gola') || sub.includes('gola')) {
    return '/ice gola.jpeg';
  }

  // Potato Twister
  if (name.includes('potato twister') || sub.includes('potato twister') || name.includes('twister') || sub.includes('twister')) {
    return '/potato twister.jpeg';
  }

  // Sweet Corn
  if (name.includes('sweet corn') || sub.includes('sweet corn') || name.includes('corn') || sub.includes('corn')) {
    return '/sweet corn.jpeg';
  }

  // Chocolate Fountain
  if (
    name.includes('chocolate fountain') ||
    name.includes('chocalate') ||
    sub.includes('chocolate fountain') ||
    name.includes('fountain') ||
    sub.includes('fountain')
  ) {
    return '/chocalate fontain.jpeg';
  }

  // Cotton Candy
  if (name.includes('cotton candy') || sub.includes('cotton candy') || name.includes('candy') || sub.includes('candy')) {
    return '/cotton candy.jpeg';
  }

  // Popcorn
  if (name.includes('pop corn') || name.includes('popcorn') || sub.includes('popcorn') || sub.includes('pop corn')) {
    return '/pop corn.jpeg';
  }

  // Tattoo Artist
  if (name.includes('tattoo') || sub.includes('tattoo') || name.includes('tatoo') || sub.includes('tatoo')) {
    return '/tatoo.jpeg';
  }

  // Proposal / Terrace
  if (
    ((name.includes('terrace proposal') || name.includes('marry me') || name.includes('proposal') || sub.includes('terrace proposal') || sub.includes('proposal'))) &&
    !isLanding
  ) {
    return '/tearce.jpeg';
  }

  // Car Boot
  if (
    name.includes('car boot') ||
    name.includes('car trunk') ||
    sub.includes('car boot') ||
    sub.includes('car boot surprises') ||
    sub.includes('car trunk')
  ) {
    return '/car bot.jpeg';
  }

  // Cabana
  if ((name.includes('cabana') || sub.includes('cabana')) && !isLanding) {
    return '/kkkk.jpeg';
  }

  // Kids Themes
  if (
    name.includes('teddy bear') ||
    name.includes('cloud arch') ||
    (cat.includes('kids') && sub.includes('kids theme')) ||
    name.includes('kids theme') ||
    sub.includes('kids theme')
  ) {
    return '/kids theme.jpeg';
  }

  return (
    product.image ||
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=700&auto=format&fit=crop&q=85'
  );
}

export function resolveProductImagePosition(product: {
  name?: string;
  subcategory?: string;
  categoryName?: string;
  image?: string;
}): string {
  const name = (product.name || '').toLowerCase();
  const sub = (product.subcategory || '').toLowerCase();

  // Chocolate fountain: focal point at top 6% to clearly show the entire fountain, dome & strawberry tiers
  if (
    name.includes('chocolate fountain') ||
    name.includes('chocalate') ||
    sub.includes('chocolate fountain') ||
    name.includes('fountain') ||
    sub.includes('fountain')
  ) {
    return 'object-[center_6%]';
  }

  // Kids theme portrait: focus on decor
  if (name.includes('teddy bear') || name.includes('cloud arch') || name.includes('kids theme') || sub.includes('kids theme')) {
    return 'object-[center_60%]';
  }

  return 'object-center';
}
