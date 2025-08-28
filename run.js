const { crit, mastery, versatility, CONVERSION_CONSTANTS } = require('./attributeConverters');

// 简化的 calculateDamage 函数，只关注核心属性对伤害的影响
function calculateSimplifiedDamage(critValue, masteryValue, versatilityValue) {
    // 固定基础值和假设
    const physAtk = 1000;
    const elemAtk = 0;
    const refineAtk = 0;
    const thunderSeal = 1; // 确保精通生效
    const skillMulti = 100; // 技能倍率100%
    const skillAdd = 0; // 技能附加伤害0
    const monsterDefense = 2785; // 怪物防御
    const baseCritPercent = CONVERSION_CONSTANTS.BASE_CRIT_PERCENT; // 基础暴击5%
    const baseMasteryPercent = CONVERSION_CONSTANTS.BASE_MASTERY_PERCENT; // 基础精通6%
    const critDmg = 0; // 基础暴击伤害加成0%

    // 1. 属性值转换为百分比
    const critPercent = crit.calculate(critValue, false); // pursuitActive = false
    const masteryPercent = mastery.calculate(masteryValue);
    const versatilityPercent = versatility.calculate(versatilityValue);

    // 2. 代入 damageCalculator 的核心公式
    // damageCalculator.js 中的相关变量
    let critRate = critPercent; // 暴击率
    let effectiveMastery = thunderSeal > 0 ? masteryPercent : 0; // 精通，受thunderSeal影响
    let allRound = versatilityPercent; // 全能

    // 简化后的天赋、套装、模组、Buff等因素均不考虑，所以相关加成均为0

    // 计算防御修正系数
    const defenseFactor = 6500 / (monsterDefense + 6500);
    const critDefenseFactor = defenseFactor; // 不考虑天赋6对暴击防御的修正

    // 计算雷印伤害增加比例 (thunderSealMulti)
    const thunderSealMulti = 0.25; // 假设talent3为false

    // 计算各种系数
    const baseAttackNonCrit = physAtk * defenseFactor + elemAtk + refineAtk;
    const baseAttackCrit = physAtk * critDefenseFactor + elemAtk + refineAtk;
    const skillMultiplier = skillMulti / 100;
    const thunderMasteryMulti = 1 + thunderSeal * thunderSealMulti + effectiveMastery * 0.025; // 精通影响

    // 普通目标公共乘数 (简化，只考虑核心属性影响)
    const normalPublicMultiplier = 1; // 假设meleeDmg, bossDmg, vulnDmg, skillDmg, physDmg均为0

    const elementMultiplier = 1; // 假设elemBonus为0
    const allRoundMultiplier = 1 + allRound * 0.0035; // 全能影响
    let critDmgMultiplier = 1 + critDmg / 100; // 暴击伤害加成

    // 不考虑天赋2的暴击溢出转换为暴击伤害

    // 计算基础伤害 (单次命中)
    const baseDamageNonCrit = baseAttackNonCrit * skillMultiplier * thunderMasteryMulti + skillAdd;
    const baseDamageCrit = baseAttackCrit * skillMultiplier * thunderMasteryMulti + skillAdd;

    // 计算普通目标伤害 (单次命中)
    const nonCritDamage = baseDamageNonCrit * normalPublicMultiplier * elementMultiplier * allRoundMultiplier;
    const critDamage = baseDamageCrit * normalPublicMultiplier * elementMultiplier * allRoundMultiplier * critDmgMultiplier;

    // 计算期望伤害
    const expectedDamage = nonCritDamage * (1 - Math.min(100, critRate) / 100) + critDamage * (Math.min(100, critRate) / 100);

    return expectedDamage;
}

// 属性分配模拟
const totalAttributePoints = 8000;
const step = 50; // 搜索步长，可以调整以平衡精度和计算时间

// 计算达到50%暴击所需的最小暴击值
// 50 = (critValue / (critValue + 4458.1)) * 100 + 5
// 45 = (critValue / (critValue + 4458.1)) * 100
// 0.45 = critValue / (critValue + 4458.1)
// 0.45 * critValue + 0.45 * 4458.1 = critValue
// 0.45 * 4458.1 = 0.55 * critValue
// critValue = (0.45 * 4458.1) / 0.55
const minCritValueFor50Percent = Math.ceil((0.45 * CONVERSION_CONSTANTS.CRIT_RATIO_DIVISOR) / 0.55);

let maxDamage = 0;
let bestAllocation = { crit: 0, mastery: 0, versatility: 0 };

console.log("开始模拟属性分配 (暴击率至少50%)...");

// 确保暴击点数至少满足50%暴击率的要求
if (totalAttributePoints < minCritValueFor50Percent) {
    console.log(`总属性点数 (${totalAttributePoints}) 不足以达到50%暴击率所需的最小暴击值 (${minCritValueFor50Percent})。`);
    // 此时无法满足条件，直接返回或进行其他处理
    // 为了继续模拟，我们将强制将所有点数分配给暴击，并报告无法达到50%暴击率
    bestAllocation.crit = totalAttributePoints;
    maxDamage = calculateSimplifiedDamage(totalAttributePoints, 0, 0);
    console.log("无法达到50%暴击率，将所有点数分配给暴击。");
} else {
    // 从总点数中预留出满足50%暴击率的暴击点数
    const remainingPoints = totalAttributePoints - minCritValueFor50Percent;

    // 遍历剩余点数在精通和全能之间的分配
    for (let masteryPoints = 0; masteryPoints <= remainingPoints; masteryPoints += step) {
        const versatilityPoints = remainingPoints - masteryPoints;

        if (versatilityPoints >= 0) {
            const currentCritPoints = minCritValueFor50Percent; // 暴击点数固定为满足50%暴击率的最小值
            const currentDamage = calculateSimplifiedDamage(currentCritPoints, masteryPoints, versatilityPoints);

            if (currentDamage > maxDamage) {
                maxDamage = currentDamage;
                bestAllocation = {
                    crit: currentCritPoints,
                    mastery: masteryPoints,
                    versatility: versatilityPoints
                };
            }
        }
    }
}

console.log("\n模拟完成。");
console.log("最优属性分配：");
console.log(`  暴击值: ${bestAllocation.crit}`);
console.log(`  精通值: ${bestAllocation.mastery}`);
console.log(`  全能值: ${bestAllocation.versatility}`);
console.log(`  最高期望伤害: ${maxDamage.toFixed(2)}`);

// 计算最优分配下的百分比
const bestCritPercent = crit.calculate(bestAllocation.crit, false);
const bestMasteryPercent = mastery.calculate(bestAllocation.mastery);
const bestVersatilityPercent = versatility.calculate(bestAllocation.versatility);

console.log("\n最优分配下的属性百分比：");
console.log(`  总暴击%: ${bestCritPercent.toFixed(2)}%`);
console.log(`  总精通%: ${bestMasteryPercent.toFixed(2)}%`);
console.log(`  总全能%: ${bestVersatilityPercent.toFixed(2)}%`);
