/**
 * Seed real event photos from NLE-frontend/public/ onto Product documents.
 *
 *   npx tsx src/scripts/seed-images.ts            # dry run -- prints planned changes
 *   npx tsx src/scripts/seed-images.ts --apply    # writes to the DB (+ backup file)
 *
 * Rules:
 *  - Only touches a product whose current `image` is empty, a known generic
 *    placeholder, or a "/foo.jpeg" path that does not exist in public/.
 *    Real Cloudinary uploads are left untouched.
 *  - Matches a photo gallery by `subcategory` first, then `categoryName`.
 *  - Sets `image` to the first existing gallery photo and fills `moreImages`
 *    with the rest (deduped, capped at 10).
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Product from "../../models/Product";

const APPLY = process.argv.includes("--apply");
const PUBLIC_DIR = path.resolve(__dirname, "../../../NLE-frontend/public");

const GENERIC = new Set(
  ["/cardddd.jpeg", "/final_logo.jpeg", "/nav bar.jpeg", "/refrence card.jpeg", "/webbbb.jpeg", "/og-default.jpg"].map((s) =>
    s.toLowerCase()
  )
);

/** subcategory (lowercased) -> ordered candidate photos */
const BY_SUBCATEGORY: Record<string, string[]> = {
  "boy kids themes": ["/boy theme.jpeg", "/boy theme 2.jpeg", "/boy theme 3.jpeg", "/boy theme 4.jpeg"],
  "boy theme": ["/boy theme.jpeg", "/boy theme 2.jpeg", "/boy theme 3.jpeg", "/boy theme 4.jpeg"],
  "terrace proposals": [
    "/terrace propsal set up.jpeg", "/terrace propsal set up 3.jpeg", "/terrace propsal set up 4.jpeg",
    "/terrace propsal set up 5.jpeg", "/terrace propsal set up 6.jpeg", "/terrace-proposal.jpeg", "/terrace.jpeg",
  ],
  "heart arch setup": ["/heart arch set up 1.jpeg", "/heart arch set up 2.jpeg", "/heart arch set up 3.jpeg"],
  "candlelight pathway": ["/candelight pathway 1.jpeg", "/candelight pathway 2.jpeg", "/candelight pathway 3.jpeg", "/candelight pathway 4.jpeg"],
  "bride-to-be": ["/bride to be.jpeg", "/bride to be 3.jpeg", "/bride to be 4.jpeg", "/bride to be 5.jpeg"],
  "groom-to-be": ["/groom to be.jpeg", "/groom to be 2.jpeg", "/groom to be 3.jpeg", "/groom to be 4.jpeg", "/groom to be 5.jpeg"],
  "engagement decor": ["/pre and post 2.jpeg", "/pre and post 3.jpeg", "/pre and post 4.jpeg"],
  "haldi ceremony": ["/pre and post 5.jpeg", "/pre and post 6.jpeg", "/pre and post 7.jpeg"],
  "ring ceremony": ["/pre and post 3.jpeg", "/pre and post 8.jpeg"],
  "gift hampers": ["/gift hamper.jpeg", "/gift hamper 1.jpeg", "/gift hamper 2.jpeg", "/gift hamper 3.jpeg", "/gift hamper 5.jpeg", "/gift hamper 6.jpeg", "/gift hamper 7.jpeg"],
  "return gifts": ["/return gift.jpeg", "/return gift 1.jpeg", "/return gift 2.jpeg"],
  "flower bouquets": ["/flower bouqets.jpeg", "/flower bouqets 2.jpeg", "/flower bouqets 3.jpeg", "/flower bouqets 4.jpeg", "/flower bouqets 5.jpeg"],
  "customised cakes": ["/customsid cakes.jpeg", "/customsid cake 2.jpeg", "/customsid cakes 4.jpeg", "/costumzide cake 4.jpeg", "/costumzide cake 5.jpeg"],
  popcorn: ["/popcorn.jpeg", "/pop corn.jpeg"],
  "cotton candy": ["/cotton candy.jpeg"],
  "chocolate fountain": ["/chocolate fountain.jpeg", "/chocalate fontain.jpeg"],
  "ice gola": ["/ice gola.jpeg"],
  "ice cream flavours": ["/ice cream.jpeg"],
  "sweet corn": ["/sweet corn.jpeg"],
  "potato twister": ["/potato twister.jpeg"],
  "instant maggi": ["/instant maggi.jpeg"],
  "chaat counters": ["/chat counter.jpeg"],
  "fruit salad": ["/fruit salad.jpeg"],
  "live pani puri": ["/pani puri.jpeg"],
  caricature: ["/caricatore.jpeg"],
  "tattoo artist": ["/tattoo.jpeg", "/tatoo.jpeg", "/tatoo 1.jpeg", "/tatoo 2.jpeg"],
  magician: ["/MAGICIAN.jpeg"],
  mascot: ["/mascot.jpeg", "/MASCOT FOR HOME PAGE.jpeg"],
  mehendi: ["/mehandi.jpeg"],
  "nail art": ["/nail art.jpeg"],
  pottery: ["/pottery.jpeg", "/pottery 2.jpeg"],
  "pebble stone painting": ["/pebble stone paint.jpeg"],
  "hair braiding": ["/hair braiding.jpeg"],
  trampoline: ["/trampoling.jpeg"],
  "bouncy castle": ["/bouncy castle.jpeg"],
  "balloon modelling": ["/balloon modelling.jpeg"],
  "balloon shooting": ["/balloan shooting.jpeg"],
  "game host / anchor / emcee": ["/game host.jpeg", "/game host2.jpeg", "/anchore.jpeg"],
  "face painting": ["/tattoo.jpeg"],
};

/** categoryName (lowercased) -> ordered candidate photos */
const BY_CATEGORY: Record<string, string[]> = {
  "simple wall decors": ["/simple-wall-decor.jpg", "/simple-wall-decors.jpg", "/SIMPLE WALL FOR HOME PAGE.jpeg"],
  "simple wall decor": ["/simple-wall-decor.jpg", "/simple-wall-decors.jpg"],
  birthday: ["/birthday.jpeg", "/BIRTHDAY FOR HOME PAGE.jpeg", "/birthday-landscape.jpg"],
  birthdays: ["/birthday.jpeg", "/BIRTHDAY FOR HOME PAGE.jpeg"],
  "1st birthday": ["/1st birthday.jpeg", "/1st-birthday.jpeg", "/1ss.jpeg", "/1ST BIRTHDAY FOR HOME PAGE.jpeg"],
  "1st birthday designs": ["/1st birthday.jpeg", "/1st-birthday.jpeg", "/1ss.jpeg"],
  "baby shower": ["/baby shower.jpeg", "/baby-shower.jpeg", "/BABY SHOWER FOR HOME PAGE.jpeg"],
  "baby showers": ["/baby shower.jpeg", "/baby-shower.jpeg"],
  "welcome baby": ["/welcome baby.jpeg", "/welcome baby 2.jpeg", "/welcome baby 3.jpeg", "/welcome baby 4.jpeg", "/welcome baby 5.jpeg", "/welcome baby 6.jpeg", "/WELCOME FOR HOME PAGE.jpeg"],
  "anniversary celebrations": ["/ANNIVERSAY FOR HOME PAGE.jpeg", "/cabana set up 3.jpeg", "/cabana set up 5.jpeg"],
  "naming ceremony": ["/NAMING CERMERIONS CARD.jpeg", "/naming cermerions 2.jpeg", "/naming cermerions 3.jpeg", "/NAMING  FOR HOME PAGE.jpeg"],
  "naming ceremonies": ["/NAMING CERMERIONS CARD.jpeg", "/naming cermerions 2.jpeg", "/naming cermerions 3.jpeg"],
  annaprashan: ["/ANNAPARAS CARD.jpeg", "/food.jpeg", "/food 3.jpeg", "/food 5.jpeg"],
  "pre & post wedding decors": ["/PRE AND POST CARD.jpeg", "/pre and post 2.jpeg", "/pre and post 3.jpeg", "/pre and post 4.jpeg", "/pre and post 5.jpeg", "/pre and post 6.jpeg", "/PRE AND POST WEDDING FOR HOME PAGE.jpeg"],
  "pre & post wedding": ["/PRE AND POST CARD.jpeg", "/pre and post 2.jpeg", "/pre and post 3.jpeg", "/pre and post 4.jpeg"],
  "cabana setups": ["/cabana.jpeg", "/cabana set up 2.jpeg", "/cabana set up 3.jpeg", "/cabana set up 4.jpeg", "/cabana set up 5.jpeg", "/cabana set up 6.jpeg", "/kkkk.jpeg"],
  "kids activities": ["/kids activities.jpeg", "/kids-activities.jpeg", "/kids theme.jpeg", "/kids jungle activites.jpeg"],
  "opening decors": ["/OPINING CARD.jpeg", "/opining 2.jpeg", "/opining 4.jpeg", "/opining5.jpeg", "/opining6.jpeg", "/opining7.jpeg"],
  "national festivals": ["/NATIONAL FISTIVAL CARD.jpeg", "/national fistival.jpeg", "/national fistival 5.jpeg", "/national fistive 2.jpeg"],
  graduation: ["/GRADUATION CARD.jpeg", "/graduation.jpeg", "/graduation set up.jpeg", "/graduation set up 2.jpeg", "/graduation set up 3.jpeg"],
  "bike & car deliveries": ["/BIKE AND CAR DELIVER CARD.jpeg", "/car deliver.jpeg", "/car deliver (2).jpeg", "/car deliver (3).jpeg", "/car deliver 4.jpeg", "/car deliver 5.jpeg"],
  "car boot surprises": ["/car bot.jpeg", "/car bot 1.jpeg", "/car bot 2.jpeg", "/car bot 3.jpeg"],
  "live eateries": ["/food.jpeg", "/food 3.jpeg", "/food 5.jpeg", "/food 6.jpeg", "/food 7.jpeg"],
  "live eateries / catering": ["/food.jpeg", "/food 3.jpeg", "/food 5.jpeg"],
  "proposal setup": ["/proposal set up.jpeg", "/proposal set up 1.jpeg", "/proposal set up 2.jpeg", "/proposal set up 3.jpeg", "/tearce.jpeg"],
};

const exists = (rel: string) => {
  try {
    return fs.existsSync(path.join(PUBLIC_DIR, decodeURIComponent(rel.replace(/^\//, ""))));
  } catch {
    return false;
  }
};
const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();
const isRealUrl = (img: string) => /^https?:\/\//i.test(img) && !/unsplash\.com|placehold|dummyimage/i.test(img);

function needsImage(img: string): boolean {
  const v = (img || "").trim();
  if (!v) return true;
  if (isRealUrl(v)) return false; // keep genuine Cloudinary / hosted uploads
  if (/unsplash\.com|placehold|dummyimage/i.test(v)) return true;
  if (v.startsWith("/")) return GENERIC.has(v.toLowerCase()) || !exists(v);
  return true;
}

function galleryFor(p: any): string[] {
  const sub = norm(p.subcategory);
  const cat = norm(p.categoryName);
  const pick =
    BY_SUBCATEGORY[sub] ||
    BY_CATEGORY[sub] ||
    BY_CATEGORY[cat] ||
    [];
  return pick.filter(exists);
}

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri);
  console.log(`Connected. Public dir: ${PUBLIC_DIR} (exists: ${fs.existsSync(PUBLIC_DIR)})`);

  const products = await Product.find().lean<any[]>();
  const changes: any[] = [];

  for (const p of products) {
    const gallery = galleryFor(p);
    if (gallery.length === 0) continue;

    const setImage = needsImage(p.image);
    const currentMore: string[] = Array.isArray(p.moreImages) ? p.moreImages.filter(Boolean) : [];
    const newImage = setImage ? gallery[0] : p.image;

    const mergedMore = Array.from(
      new Set([
        ...currentMore.filter((m) => isRealUrl(m) || exists(m)),
        ...gallery.filter((g) => g !== newImage),
      ])
    ).slice(0, 10);

    const moreChanged = JSON.stringify(mergedMore) !== JSON.stringify(currentMore);
    if (!setImage && !moreChanged) continue;

    changes.push({
      _id: String(p._id),
      name: p.name,
      category: p.categoryName,
      subcategory: p.subcategory || "",
      before: { image: p.image || "", moreImages: currentMore.length },
      after: { image: newImage, moreImages: mergedMore.length },
      _setImage: setImage,
      _newImage: newImage,
      _newMore: mergedMore,
    });
  }

  console.log(`\n${products.length} products scanned, ${changes.length} to update.\n`);
  for (const c of changes) {
    console.log(
      `• ${c.name}  [${c.category}${c.subcategory ? " / " + c.subcategory : ""}]\n` +
        `    image:  ${c.before.image || "(empty)"}  ->  ${c._setImage ? c._newImage : "(unchanged)"}\n` +
        `    more:   ${c.before.moreImages}  ->  ${c.after.moreImages}`
    );
  }

  if (!APPLY) {
    console.log(`\nDry run. Re-run with --apply to write these ${changes.length} changes.`);
    await mongoose.disconnect();
    return;
  }

  const backupPath = path.resolve(__dirname, `../../image-seed-backup.${Date.now()}.json`);
  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      changes.map((c) => ({ _id: c._id, image: c.before.image, moreImagesCount: c.before.moreImages })),
      null,
      2
    )
  );
  console.log(`\nBackup written: ${backupPath}`);

  let applied = 0;
  for (const c of changes) {
    const update: any = { moreImages: c._newMore };
    if (c._setImage) update.image = c._newImage;
    await Product.updateOne({ _id: c._id }, { $set: update });
    applied++;
  }
  console.log(`Applied ${applied} product image updates.`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
