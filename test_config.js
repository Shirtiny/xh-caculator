const calculateDamage = require('./damageCalculator.js');
const fs = require('fs');

// 读取配置文件
const config = JSON.parse(fs.readFileSync('zhizhumutou.json', 'utf8'));

console.log('=== 蜘蛛母头配置文件测试 ===');
console.log('配置文件参数:');
console.log(`物理攻击: ${config.physAtk}`);
console.log(`元素攻击: ${config.elemAtk}`);
console.log(`精炼攻击: ${config.refineAtk}`);
console.log(`精通%: ${config.mastery}`);
console.log(`雷之印: ${config.thunderSeal}`);
console.log(`暴击率: ${config.critRate}%`);
console.log(`暴击伤害: ${config.critDmg}%`);
console.log(`全能%: ${config.allRound}`);
console.log(`元素加成%: ${config.elemBonus}`);
console.log('');

// 计算伤害
const result = calculateDamage(config);

console.log('=== 计算结果 ===');
console.log(`非暴击伤害: ${result.nonCritDamage}`);
console.log(`暴击伤害: ${result.critDamage}`);
console.log(`期望伤害: ${result.expectedDamage}`);
console.log(`最终暴击率: ${result.finalCritRate}`);

// 详细分析天赋和模组效果
console.log('\n=== 天赋和模组分析 ===');

// 天赋效果
const talents = [];
if (config.talent1) talents.push('居合流');
if (config.talent2) talents.push('居合天授＆暴斩');
if (config.talent3) talents.push('疾电破袭');
if (config.talent4) talents.push('雷咒');
if (config.talent5) talents.push('瞬斩');
if (config.talent6) talents.push('破斩');
if (config.talent7) talents.push('雷返');
if (config.talent8) talents.push('暴裂');
if (config.talent10) talents.push('雷印亲和');
if (config.talent11) talents.push('回溯冥想');
if (config.talent12) talents.push('锐击＆刀意双绝');
if (config.talent13) talents.push('追击风袭上＆下');
if (config.talent14) talents.push('精进');

console.log('启用的天赋:', talents.join(', '));

// 模组效果
const modules = [];
if (config.module1Enabled) modules.push('敏捷加持');
if (config.module2Enabled) modules.push('特攻伤害加持');
if (config.module3Enabled) modules.push('精英打击');
if (config.module4Enabled) modules.push('暴击专注');
if (config.module5Enabled) modules.push('极·伤害叠加');
if (config.module6Enabled) modules.push('极·灵活身法');

console.log('启用的模组:', modules.join(', '));

// 套装效果
const sets = [];
if (config.weaponSet) sets.push('武器');
if (config.twoPieceSet) sets.push('2件套');
if (config.fourPieceSet) sets.push('4件套');

console.log('启用的套装:', sets.join(', '));

console.log('\n=== 伤害分析 ===');
const nonCritNum = parseFloat(result.nonCritDamage);
const critNum = parseFloat(result.critDamage);
const expectedNum = parseFloat(result.expectedDamage);
const critRateNum = parseFloat(result.finalCritRate);

console.log(`暴击倍率: ${(critNum / nonCritNum).toFixed(2)}倍`);
console.log(`暴击增幅: ${((critNum / nonCritNum - 1) * 100).toFixed(1)}%`);
console.log(`期望vs非暴击: ${((expectedNum / nonCritNum - 1) * 100).toFixed(1)}%增幅`);

console.log('\n=== 测试完成 ===');
