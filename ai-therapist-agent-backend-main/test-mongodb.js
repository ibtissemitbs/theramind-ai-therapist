require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Test de connexion MongoDB...\n');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI non trouvé dans .env');
  process.exit(1);
}

console.log('📋 URI (masqué):', uri.replace(/:[^:@]+@/, ':****@'));
console.log('📏 Longueur URI:', uri.length);
console.log('\n🔄 Tentative de connexion...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  family: 4,
})
.then(() => {
  console.log('✅ CONNEXION RÉUSSIE !');
  console.log('🎉 MongoDB est bien configuré et accessible');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ ÉCHEC DE CONNEXION');
  console.error('Message:', error.message);
  console.error('\n🔍 Causes possibles:');
  console.error('  1. IP non autorisée (malgré la liste)');
  console.error('  2. Cluster MongoDB en pause');
  console.error('  3. Problème de réseau/firewall');
  console.error('  4. Credentials incorrects');
  console.error('\n💡 Action: Vérifiez que le cluster est ACTIF sur MongoDB Atlas');
  process.exit(1);
});

setTimeout(() => {
  console.error('\n⏱️  Timeout après 10 secondes');
  process.exit(1);
}, 15000);
