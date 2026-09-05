export function resolveProductCardImage(product: {
  name?: string;
  subcategory?: string;
  categoryName?: string;
  image?: string;
}, isLanding?: boolean): string {
  const name = (product.name || '').toLowerCase();
  const sub = (product.subcategory || '').toLowerCase();

  // If the product already carries a real, curated local photo, use it as-is
  // -- the keyword rules below are only a fallback for products whose image
  // is missing, an external URL, or a generic placeholder. This keeps
  // per-card distinct gallery images (e.g. "Gift Hampers Theme Setup 1..7")
  // from all collapsing to a single keyword-matched picture.
  const GENERIC_IMAGES = ['/cardddd.jpg', '/final_logo.jpg', '/nav bar.jpg', '/refrence card.jpg', '/webbbb.jpg'];
  const img = (product.image || '').trim();
  if (img.startsWith('/') && !GENERIC_IMAGES.includes(img.toLowerCase())) {
    return img;
  }

  // Ice Gola Counter
  if (name.includes('ice gola') || sub.includes('ice gola') || name.includes('gola') || sub.includes('gola')) {
    return '/ice gola.jpg';
  }

  // Potato Twister
  if (name.includes('potato twister') || sub.includes('potato twister') || name.includes('twister') || sub.includes('twister')) {
    return '/potato twister.jpg';
  }

  // Sweet Corn
  if (name.includes('sweet corn') || sub.includes('sweet corn') || name.includes('corn') || sub.includes('corn')) {
    return '/sweet corn.jpg';
  }

  // Chocolate Fountain
  if (
    name.includes('chocolate fountain') ||
    name.includes('chocalate') ||
    sub.includes('chocolate fountain') ||
    name.includes('fountain') ||
    sub.includes('fountain')
  ) {
    return '/chocalate fontain.jpg';
  }

  // Cotton Candy
  if (name.includes('cotton candy') || sub.includes('cotton candy') || name.includes('candy') || sub.includes('candy')) {
    return '/cotton candy.jpg';
  }

  // Popcorn
  if (name.includes('pop corn') || name.includes('popcorn') || sub.includes('popcorn') || sub.includes('pop corn')) {
    return '/pop corn.jpg';
  }

  // --- Pre & Post Wedding sub-services ---
  {
    const wv = `${name} ${sub}`;
    if (wv.includes('groom-to-be') || wv.includes('groom to be')) return '/groom to be.jpg';
    if (wv.includes('bride-to-be') || wv.includes('bride to be')) return '/bride to be.jpg';
  }

  // --- Proposal Setup sub-services & related ---
  // NOTE: match on the product NAME only (never the shared subcategory),
  // so real DB products in these groups keep their own distinct photos and
  // only the curated fallback cards (whose names contain the keyword) map here.
  {
    if (name.includes('heart arch')) return '/heart arch set up 1.jpg';
    if (name.includes('candlelight pathway') || name.includes('candelight pathway')) return '/candelight pathway 1.jpg';
    if (name.includes('terrace proposal') || name.includes('terrace propsal')) return '/terrace propsal set up.jpg';
    if (name.includes('boy theme') || name.includes('boy kids theme')) return '/boy theme.jpg';
    if (name.includes('naming ceremon') || name.includes('namkaran')) return '/NAMING CERMERIONS CARD.jpg';
  }

  // --- Other Services sub-services ---
  {
    const ov = `${name} ${sub}`;
    if (ov.includes('return gift')) return '/return gift.jpg';
    if (ov.includes('flower bouquet') || ov.includes('flower bouqet') || ov.includes('bouquet')) return '/flower bouqets.jpg';
    if (ov.includes('customised cake') || ov.includes('customized cake') || ov.includes('custom cake')) return '/customsid cakes.jpg';
    if (ov.includes('gift hamper') || ov.includes('hamper')) return '/gift hamper.jpg';
  }

  // --- Live Eateries / Catering sub-services ---
  {
    const ev = `${name} ${sub}`;
    if (ev.includes('maggi') || ev.includes('maggie')) return '/instant maggi.jpg';
    if (ev.includes('chaat') || ev.includes('chat counter')) return '/chat counter.jpg';
    if (ev.includes('fruit salad')) return '/fruit salad.jpg';
    if (ev.includes('pani puri') || ev.includes('panipuri') || ev.includes('golgappa') || ev.includes('puchka')) return '/pani puri.jpg';
    if (ev.includes('ice cream')) return '/ice cream.jpg';
  }

  // Tattoo Artist
  if (name.includes('tattoo') || sub.includes('tattoo') || name.includes('tatoo') || sub.includes('tatoo')) {
    return '/tatoot 3.jpg';
  }

  // --- Kids Activities & Entertainment sub-services ---
  const kv = `${name} ${sub}`;
  if (kv.includes('trampolin')) return '/trampoling.jpg';
  if (kv.includes('juggl')) return '/kids jungle activites.jpg';
  if (kv.includes('mehendi') || kv.includes('mehandi') || kv.includes('henna')) return '/mehandi.jpg';
  if (kv.includes('mascot')) return '/mascot.jpg';
  if (kv.includes('magician') || kv.includes('magic show')) return '/MAGICIAN.jpg';
  if (kv.includes('caricat')) return '/caricatore.jpg';
  if (kv.includes('bouncy') || kv.includes('bounce castle')) return '/bouncy castle.jpg';
  if (kv.includes('braid')) return '/hair braiding.jpg';
  if (kv.includes('pottery') || kv.includes('clay')) return '/pottery.jpg';
  if (kv.includes('nail art') || kv.includes('nailart')) return '/nail art.jpg';
  if (kv.includes('pebble')) return '/pebble stone paint.jpg';
  if (kv.includes('balloon shoot') || kv.includes('ballon shoot')) return '/balloan shooting.jpg';
  if (kv.includes('balloon model') || kv.includes('balloon twist')) return '/balloon modelling.jpg';
  if (kv.includes('anchor') || kv.includes('emcee') || kv.includes('mc ')) return '/anchore.jpg';
  if (kv.includes('game') || kv.includes(' host')) return '/game host2.jpg';

  // Proposal / Terrace
  if (
    ((name.includes('terrace proposal') || name.includes('marry me') || name.includes('proposal') || sub.includes('terrace proposal') || sub.includes('proposal'))) &&
    !isLanding
  ) {
    return '/tearce.jpg';
  }

  // Car Boot
  if (
    name.includes('car boot') ||
    name.includes('car trunk') ||
    sub.includes('car boot') ||
    sub.includes('car boot surprises') ||
    sub.includes('car trunk')
  ) {
    return '/car bot.jpg';
  }

  // Cabana
  if ((name.includes('cabana') || sub.includes('cabana')) && !isLanding) {
    return '/kkkk.jpg';
  }

  // Kids Themes -- only for products whose own NAME says so (never the
  // shared "Kids Themes" / "Boy Kids Themes" subcategory, which would
  // collapse every distinct product in that group to one photo).
  if (
    name.includes('teddy bear') ||
    name.includes('cloud arch') ||
    name.includes('kids theme') ||
    name.includes('pastel teddy')
  ) {
    return '/kids theme.jpg';
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
  if (name.includes('teddy bear') || name.includes('cloud arch') || name.includes('kids theme')) {
    return 'object-[center_60%]';
  }

  return 'object-center';
}
