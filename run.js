const fs = require('fs');
const calculateDamage = require('./damageCalculator');

const configs = JSON.parse(fs.readFileSync('tachiConfigs.json', 'utf-8'));

for (const configName in configs) {
  const config = configs[configName];
  const damageResult = calculateDamage(config);
  
  console.log(`Configuration: ${configName}`);
  console.log(`  Non-Crit Damage: ${damageResult.nonCritDamage}`);
  console.log(`  Crit Damage: ${damageResult.critDamage}`);
  console.log(`  Expected Damage: ${damageResult.expectedDamage}`);
  console.log(`  Final Crit Rate: ${damageResult.finalCritRate}`);
  console.log('--------------------');
}
