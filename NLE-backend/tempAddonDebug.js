const mongoose = require('mongoose');
const fs = require('fs');
const Product = require('./models/Product');
(async () => {
  try {
    const env = fs.readFileSync('.env', 'utf8');
    const match = env.match(/^MONGO_URI=(.*)$/m);
    if (!match) throw new Error('MONGO_URI not found');
    process.env.MONGO_URI = match[1].trim();
    await mongoose.connect(process.env.MONGO_URI, { bufferCommands:false, serverSelectionTimeoutMS:5000 });
    const docs = await Product.find({ $or:[{ addons: { $exists: true, $not: { $size: 0 } }}, { addOns: { $exists: true, $not: { $size: 0 } } }]}).limit(30).lean();
    console.log('Found', docs.length, 'products with addons refs or addOns inline');
    docs.forEach(p => {
      console.log('---');
      console.log('Product ID:', p._id.toString());
      console.log('Name:', p.name);
      console.log('addons len:', Array.isArray(p.addons) ? p.addons.length : 0, 'sample', JSON.stringify((p.addons || []).slice(0, 5)));
      console.log('addOns len:', Array.isArray(p.addOns) ? p.addOns.length : 0, 'sample', JSON.stringify((p.addOns || []).slice(0, 5)));
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();