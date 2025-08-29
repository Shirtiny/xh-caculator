/**
 * 雷影剑士居合流伤害计算器 - 独立JavaScript版本
 * 基于index.html中的calculateDamage函数实现
 */

// 读取配置文件
function loadConfig(configPath = "./zhizhumutou.json") {
  const fs = require("fs");

  if (!fs.existsSync(configPath)) {
    console.error(`配置文件 ${configPath} 不存在`);
    return null;
  }

  try {
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    console.error(`读取配置文件失败: ${error.message}`);
    return null;
  }
}

// 读取历史记录
function loadHistory(historyPath = "./damage_history.json") {
  const fs = require("fs");

  if (!fs.existsSync(historyPath)) {
    return null;
  }

  try {
    const historyData = fs.readFileSync(historyPath, "utf8");
    return JSON.parse(historyData);
  } catch (error) {
    console.error(`读取历史记录失败: ${error.message}`);
    return null;
  }
}

// 保存历史记录
function saveHistory(result, historyPath = "./damage_history.json") {
  const fs = require("fs");

  const history = {
    timestamp: new Date().toISOString(),
    nonCritDamage: result.nonCritDamage,
    critDamage: result.critDamage,
    expectedDamage: result.expectedDamage,
    critRate: result.critRate
  };

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`历史记录已保存到 ${historyPath}`);
  } catch (error) {
    console.error(`保存历史记录失败: ${error.message}`);
  }
}

// 计算伤害的主要函数
function calculateDamage(config = null) {
  // 如果没有传入配置，则尝试读取默认配置文件
  if (!config) {
    config = loadConfig();
    if (!config) {
      console.error("无法加载配置文件");
      return null;
    }
  }

  console.log("=== 伤害计算器 ===\n");

  // 获取基础属性值
  let physAtk = parseFloat(config.physAtk) || 0;
  let elemAtk = parseFloat(config.elemAtk) || 0;
  let refineAtk = parseFloat(config.refineAtk) || 0;
  let masteryInput = parseFloat(config.mastery) || 0;
  let thunderSeal = parseInt(config.thunderSeal) || 0;

  // 雷之印为0时，精通%不生效
  let mastery = thunderSeal > 0 ? masteryInput : 0;

  // 公共乘区属性
  let meleeDmg = parseFloat(config.meleeDmg) || 0;
  let bossDmg = parseFloat(config.bossDmg) || 0;
  let vulnDmg = parseFloat(config.vulnDmg) || 0;
  let skillDmg = parseFloat(config.skillDmg) || 0;
  let physDmg = parseFloat(config.physDmg) || 0;

  // 独立乘区属性
  let allRound = parseFloat(config.allRound) || 0;
  let elemBonus = parseFloat(config.elemBonus) || 0;
  let critDmg = parseFloat(config.critDmg) || 0;
  let critRate = parseFloat(config.critRate) || 0;

  // 怪物防御
  let monsterDefense = 2785; // 固定值

  // 获取选中的技能
  const activeSkill = parseInt(config.activeSkill) || 1;
  let skillMulti, skillAdd;

  if (activeSkill === 1) {
    skillMulti = parseFloat(config.skill1Multi) || 0;
    skillAdd = parseFloat(config.skill1Add) || 0;
  } else if (activeSkill === 2) {
    skillMulti = parseFloat(config.skill2Multi) || 0;
    skillAdd = parseFloat(config.skill2Add) || 0;
  } else {
    skillMulti = parseFloat(config.skill3Multi) || 0;
    skillAdd = parseFloat(config.skill3Add) || 0;
  }

  // 获取天赋状态
  const talent1 = config.talent1 || false;
  const talent2 = config.talent2 || false;
  const talent3 = config.talent3 || false;
  const talent4 = config.talent4 || false;
  const talent4Level = parseInt(config.talent4Level) || 0;
  const talent5 = config.talent5 || false;
  const talent5Level = parseInt(config.talent5Level) || 0;
  const talent6 = config.talent6 || false;
  const talent7 = config.talent7 || false;
  const talent8 = config.talent8 || false;
  const talent10 = config.talent10 || false; // 雷印亲和
  const talent11 = config.talent11 || false; // 决斗意识
  const talent12 = config.talent12 || false; // 锐击天赋
  const talent13 = config.talent13 || false; // 追击风袭上＆下
  const talent14 = config.talent14 || false; // 精进

  // 声明talentBonus变量
  let talentBonus = 0;

  // 应用天赋效果（影响暴击率的天赋先计算）
  if (activeSkill === 1 && talent2) {
    critRate += 22;
  }

  // 追击风袭上＆下天赋效果
  if (talent13) {
    if (activeSkill === 1) {
      critRate += 5.28;
      talentBonus += 5.28;
    } else if (activeSkill === 2) {
      critRate += 4.8;
      talentBonus += 4.8;
    }
  }

  // 精进天赋效果
  if (talent14) {
    mastery += 6;
    talentBonus += 6;
  }

  // 其他天赋效果
  if (talent7) {
    elemBonus += 10;
    talentBonus += 10;
  }
  if (talent8) {
    critDmg += 10;
    talentBonus += 10;
  }
  if (talent4) {
    vulnDmg += talent4Level * 2;
    talentBonus += talent4Level * 2;
  }
  if (talent5) {
    const defenseReduction = 1 - talent5Level * 0.06;
    monsterDefense *= defenseReduction;
    talentBonus += talent5Level * 6; // 保持talentBonus的计算用于显示
  }
  if (activeSkill === 1 && talent1 && thunderSeal === 6) {
    skillDmg += 12;
    talentBonus += 12;
  }

  // 天赋10：雷印亲和
  if (talent10) {
    elemBonus += thunderSeal * 1.5;
    talentBonus += thunderSeal * 1.5;
  }

  // 天赋12：锐击＆锐意双绝
  if (activeSkill === 2 && talent12) {
    critRate += 20;
    talentBonus += 20;
  }

  // 天赋11：回溯冥想效果已通过调整雷之印增伤比例实现

  // 计算是否需要攻击两次（只做提示，不影响单次伤害值）
  const isDoubleAttack = activeSkill === 1 && thunderSeal >= 3;

  // 应用套装效果
  let setBonus = 0;
  // 武器：暴击伤害+15%
  if (config.weaponSet) {
    critDmg += 15;
    setBonus += 15;
  }

  // 2件套：启用技能居合斩时，技能伤害%+10%
  if (config.twoPieceSet && activeSkill === 1) {
    skillDmg += 10;
    setBonus += 10;
  }

  // 4件套：技能伤害%+6%
  if (config.fourPieceSet) {
    skillDmg += 6;
    setBonus += 6;
  }

  // 应用模组效果
  let moduleBonus = 0;
  // 模组1：敏捷加持
  if (config.module1Enabled) {
    const level = config.module1Level || "5";
    if (level === "5") {
      physDmg += 3.6;
      moduleBonus += 3.6;
    } else if (level === "6") {
      physDmg += 6;
      moduleBonus += 6;
    }
  }

  // 模组2：特攻伤害加持
  if (config.module2Enabled && activeSkill === 1) {
    const level = config.module2Level || "5";
    if (level === "5") {
      elemBonus += 7.2;
      moduleBonus += 7.2;
    } else if (level === "6") {
      elemBonus += 12;
      moduleBonus += 12;
    }
  }

  // 模组3：精英打击
  if (config.module3Enabled) {
    const level = config.module3Level || "5";
    if (level === "5") {
      bossDmg += 3.9;
      moduleBonus += 3.9;
    } else if (level === "6") {
      bossDmg += 6.6;
      moduleBonus += 6.6;
    }
  }

  // 模组4：暴击专注
  if (config.module4Enabled) {
    const level = config.module4Level || "5";
    if (level === "3") {
      elemBonus += 0.44;
      moduleBonus += 0.44;
    } else if (level === "4") {
      elemBonus += 0.88;
      moduleBonus += 0.88;
    } else if (level === "5") {
      elemBonus += 1.32;
      critDmg += 7.1;
      moduleBonus += 8.42;
    } else if (level === "6") {
      elemBonus += 1.76;
      critDmg += 12;
      moduleBonus += 13.76;
    }
  }

  // 模组5：极·伤害叠加
  if (config.module5Enabled) {
    const level = config.module5Level || "5";
    if (level === "5") {
      vulnDmg += 6.6;
      moduleBonus += 6.6;
    } else if (level === "6") {
      vulnDmg += 11;
      moduleBonus += 11;
    }
  }

  // 模组6：极·灵活身法
  let physAtkMultiplier = 1;
  if (config.module6Enabled) {
    const level = config.module6Level || "5";
    if (level === "5") {
      physAtkMultiplier = 1.06;
      moduleBonus += 6;
    } else if (level === "6") {
      physAtkMultiplier = 1.1;
      moduleBonus += 10;
    }
  }
  physAtk *= physAtkMultiplier;

  // 应用增益系统效果
  let buffBonus = 0;
  // 增益模板3：剧毒蜂巢
  if (config.buff3Enabled) {
    const buffValue = parseFloat(config.buff3Value) || 0;
    vulnDmg += buffValue;
    buffBonus += buffValue;
  }

  // 增益模板4：山贼头目
  if (config.buff4Enabled) {
    const buffValue = parseFloat(config.buff4Value) || 1;
    physAtk *= buffValue;
    buffBonus += (buffValue - 1) * 100;
  }

  // 首领伤害开关状态
  const isBossDmgActive = config.bossDmgToggle || false;
  const currentBossDmg = isBossDmgActive ? bossDmg : 0;

  // 计算防御修正系数
  let defenseFactor = 6500 / (monsterDefense + 6500);
  let critDefenseFactor = defenseFactor;
  if (activeSkill === 1 && talent6) {
    critDefenseFactor = 6500 / (monsterDefense * 0.7 + 6500);
  }

  // 计算雷之印增伤比例
  let thunderSealMulti = talent3 ? 0.28 : 0.25;
  // 回溯冥想效果：降低雷之印增伤比例
  if (talent11) {
    thunderSealMulti -= 0.125;
  }

  // 计算各项系数
  const baseAttackNonCrit = physAtk * defenseFactor + elemAtk + refineAtk;
  const baseAttackCrit = physAtk * critDefenseFactor + elemAtk + refineAtk;
  const skillMultiplier = skillMulti / 100;
  const thunderMasteryMulti =
    1 + thunderSeal * thunderSealMulti + mastery * 0.025;

  // 普通目标的公共乘数
  const normalPublicMultiplier =
    1 + (meleeDmg + currentBossDmg + vulnDmg + skillDmg + physDmg) / 100;

  const elementMultiplier = 1 + elemBonus / 100;
  const allRoundMultiplier = 1 + allRound * 0.0035;
  const allRoundAddition = allRound * 0.35; // 全能乘区加成显示值
  let critDmgMultiplier = 1 + critDmg / 100;

  // 天赋2：超额暴击转化为暴伤
  let excessCrit = 0;
  if (activeSkill === 1 && talent2 && critRate > 65.28) {
    excessCrit = critRate - 65.28;
    critDmgMultiplier += excessCrit / 100;
  }

  // 计算基础伤害（单次）
  const baseDamageNonCrit =
    baseAttackNonCrit * skillMultiplier * thunderMasteryMulti + skillAdd;
  const baseDamageCrit =
    baseAttackCrit * skillMultiplier * thunderMasteryMulti + skillAdd;

  // 计算普通目标伤害（单次）
  const nonCritDamage =
    baseDamageNonCrit *
    normalPublicMultiplier *
    elementMultiplier *
    allRoundMultiplier;
  const critDamage =
    baseDamageCrit *
    normalPublicMultiplier *
    elementMultiplier *
    allRoundMultiplier *
    critDmgMultiplier;

  // 计算伤害构成
  const physContribution =
    physAtk * defenseFactor * skillMultiplier * thunderMasteryMulti;
  const elemContribution = elemAtk * skillMultiplier * thunderMasteryMulti;
  const refineContribution = refineAtk * skillMultiplier * thunderMasteryMulti;
  const addContribution = skillAdd;

  // 计算期望伤害
  const expectedDamage =
    nonCritDamage * (1 - critRate / 100) + critDamage * (critRate / 100);

  // 输出结果
  console.log("=== 基础属性 ===");
  console.log(`物理攻击: ${physAtk.toFixed(1)}`);
  console.log(`元素攻击: ${elemAtk.toFixed(1)}`);
  console.log(`精炼攻击: ${refineAtk.toFixed(1)}`);
  console.log(`精通%: ${mastery.toFixed(2)}`);
  console.log(`雷之印: ${thunderSeal}`);
  console.log("");

  console.log("=== 技能信息 ===");
  const skillName =
    activeSkill === 1 ? "居合斩" : activeSkill === 2 ? "一闪" : "自定义";
  console.log(`当前技能: ${skillName}`);
  console.log(`技能倍率%: ${skillMulti}`);
  console.log(`附加伤害: ${skillAdd}`);
  if (isDoubleAttack) {
    console.log("⚡ 触发双倍攻击 (雷之印≥3)");
  }
  console.log("");

  console.log("=== 伤害构成分析 ===");
  console.log(
    `物理攻击贡献: ${physContribution.toFixed(1)} (${(
      (physContribution /
        (physContribution +
          elemContribution +
          refineContribution +
          addContribution)) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `元素攻击贡献: ${elemContribution.toFixed(1)} (${(
      (elemContribution /
        (physContribution +
          elemContribution +
          refineContribution +
          addContribution)) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `精炼攻击贡献: ${refineContribution.toFixed(1)} (${(
      (refineContribution /
        (physContribution +
          elemContribution +
          refineContribution +
          addContribution)) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `附加伤害贡献: ${addContribution.toFixed(1)} (${(
      (addContribution /
        (physContribution +
          elemContribution +
          refineContribution +
          addContribution)) *
      100
    ).toFixed(1)}%)`
  );
  console.log("");

  console.log("=== 乘区信息 ===");
  console.log(
    `公共乘区总加成: ${((normalPublicMultiplier - 1) * 100).toFixed(2)}%`
  );
  console.log(`全能乘区加成: ${allRoundAddition.toFixed(2)}%`);
  console.log(`元素加成: ${elemBonus.toFixed(2)}%`);
  console.log(`暴击伤害加成: ${critDmg.toFixed(2)}%`);
  console.log("");

  console.log("=== 增益效果 ===");
  if (talentBonus > 0) {
    console.log(`天赋总加成: ${talentBonus.toFixed(1)}%`);
  }
  if (setBonus > 0) {
    console.log(`套装总加成: ${setBonus.toFixed(1)}%`);
  }
  if (moduleBonus > 0) {
    console.log(`模组总加成: ${moduleBonus.toFixed(1)}%`);
  }
  if (buffBonus > 0) {
    console.log(`增益总加成: ${buffBonus.toFixed(1)}%`);
  }
  console.log("");

  console.log("=== 伤害结果 ===");
  console.log(`非暴击伤害: ${nonCritDamage.toFixed(1)}`);
  console.log(`暴击伤害: ${critDamage.toFixed(1)}`);
  console.log(`期望伤害: ${expectedDamage.toFixed(1)}`);
  console.log(`暴击率: ${critRate.toFixed(2)}%`);
  console.log("");

  // 返回计算结果
  return {
    nonCritDamage: nonCritDamage,
    critDamage: critDamage,
    expectedDamage: expectedDamage,
    critRate: critRate,
    isDoubleAttack: isDoubleAttack,
    skillName: skillName,
    damageBreakdown: {
      physAtk: physContribution,
      elemAtk: elemContribution,
      refineAtk: refineContribution,
      skillAdd: addContribution,
    },
  };
}

// 显示与历史记录的差距比较
function displayComparison(currentResult, historyResult) {
  if (!historyResult) {
    console.log("=== 历史对比 ===");
    console.log("ℹ️  首次运行，暂无历史记录进行比较");
    console.log("");
    return;
  }

  console.log("=== 历史对比 ===");
  console.log(`📅 上次运行时间: ${new Date(historyResult.timestamp).toLocaleString('zh-CN')}`);

  const nonCritDiff = currentResult.nonCritDamage - historyResult.nonCritDamage;
  const critDiff = currentResult.critDamage - historyResult.critDamage;
  const expectedDiff = currentResult.expectedDamage - historyResult.expectedDamage;
  const critRateDiff = currentResult.critRate - historyResult.critRate;

  const formatDiff = (diff, baseValue = 1) => {
    const sign = diff >= 0 ? "+" : "";
    const percent = baseValue !== 0 ? ` (${sign}${(diff / baseValue * 100).toFixed(2)}%)` : "";
    return `${sign}${diff.toFixed(1)}${percent}`;
  };
  
  console.log(`非暴击伤害: ${formatDiff(nonCritDiff, historyResult.nonCritDamage)}`);
  console.log(`暴击伤害: ${formatDiff(critDiff, historyResult.critDamage)}`);
  console.log(`期望伤害: ${formatDiff(expectedDiff, historyResult.expectedDamage)}`);
  console.log(`暴击率: ${formatDiff(critRateDiff, historyResult.critRate)}%`);
  console.log("");
}

// 主函数
function main() {
  console.log("开始计算伤害...\n");

  // 读取历史记录用于比较
  const historyResult = loadHistory();

  const result = calculateDamage();

  if (result) {
    // 显示与历史记录的比较
    displayComparison(result, historyResult);

    // 保存当前结果到历史记录
    saveHistory(result);

    console.log("✅ 伤害计算完成！");
    return result;
  } else {
    console.log("❌ 伤害计算失败！");
    return null;
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  calculateDamage,
  loadConfig,
  main,
};
