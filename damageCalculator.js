function calculateDamage(config) {
  // Get base attribute values from the config object
  let physAtk = parseFloat(config.physAtk) || 0;
  let elemAtk = parseFloat(config.elemAtk) || 0;
  let refineAtk = parseFloat(config.refineAtk) || 0;
  let masteryInput = parseFloat(config.mastery) || 0;
  let thunderSeal = parseInt(config.thunderSeal) || 0;

  // When Thunder Seal is 0, Mastery % is not effective
  let mastery = thunderSeal > 0 ? masteryInput : 0;

  // Talent 14: Proficiency - increases base skill multiplier mastery by +6%
  if (talent14) {
    mastery += 6;
  }

  // Common area attributes
  let meleeDmg = parseFloat(config.meleeDmg) || 0;
  let bossDmg = parseFloat(config.bossDmg) || 0;
  let vulnDmg = parseFloat(config.vulnDmg) || 0;
  let skillDmg = parseFloat(config.skillDmg) || 0;
  let physDmg = parseFloat(config.physDmg) || 0;

  // Independent area attributes
  let allRound = parseFloat(config.allRound) || 0;
  let elemBonus = parseFloat(config.elemBonus) || 0;
  let critDmg = parseFloat(config.critDmg) || 0;
  let critRate = parseFloat(config.critRate) || 0;

  // Monster defense
  let monsterDefense = 2785;

  // Get the selected skill
  const activeSkill = parseInt(config.activeSkill);
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

  // Get talent status
  const talent1 = config.talent1;
  const talent2 = config.talent2;
  const talent3 = config.talent3;
  const talent4 = config.talent4;
  const talent4Level = parseInt(config.talent4Level) || 0;
  const talent5 = config.talent5;
  const talent5Level = parseInt(config.talent5Level) || 0;
  const talent6 = config.talent6;
  const talent7 = config.talent7;
  const talent8 = config.talent8;
  const talent10 = config.talent10; // Thunder Seal Affinity
  const talent11 = config.talent11; // Duel Awareness
  const talent12 = config.talent12; // Sharp Strike & Sharp Sword talent
  const talent14 = config.talent14; // Proficiency talent

  // Apply talent effects (talents affecting crit rate are calculated first)
  if (activeSkill === 1 && talent2) {
    critRate += 22;
  }

  // Other talent effects
  if (talent7) {
    elemBonus += 10;
  }
  if (talent8) {
    critDmg += 10;
  }
  if (talent4) {
    vulnDmg += talent4Level * 2;
  }
  if (talent5) {
    const defenseReduction = 1 - talent5Level * 0.06;
    monsterDefense *= defenseReduction;
  }
  if (activeSkill === 1 && talent1 && thunderSeal === 6) {
    skillDmg += 12;
  }

  // Talent 10: Thunder Seal Affinity
  if (talent10) {
    elemBonus += thunderSeal * 1.5;
  }

  // Talent 12: Sharp Strike
  if (activeSkill === 2 && talent12) {
    critRate += 10;
  }

  // Calculate extra vulnerable damage from Duel Awareness
  const duelAwarenessBonus = talent11 ? 20 : 0;

  // Modification: Add Duel Awareness bonus directly to the common area
  if (talent11) {
    vulnDmg += duelAwarenessBonus;
  }

  // Boss damage switch status
  const isBossDmgActive = config.bossDmgToggle;
  const currentBossDmg = isBossDmgActive ? bossDmg : 0;

  // Apply set effects
  // Weapon: Crit damage +15%
  if (config.weaponSet) {
    critDmg += 15;
  }

  // 2-piece set: When using Iaijutsu, skill damage % +10%
  if (config.twoPieceSet && activeSkill === 1) {
    skillDmg += 10;
  }

  // 4-piece set: Skill damage % +6%
  if (config.fourPieceSet) {
    skillDmg += 6;
  }

  // Apply module effects
  // Module 1: Agility Blessing
  if (config.module1Enabled) {
    const level = config.module1Level;
    if (level === "5") {
      physDmg += 3.6;
    } else if (level === "6") {
      physDmg += 6;
    }
  }

  // Module 2: Special Attack Damage Blessing
  if (config.module2Enabled && activeSkill === 1) {
    const level = config.module2Level;
    if (level === "5") {
      elemBonus += 7.2;
    } else if (level === "6") {
      elemBonus += 12;
    }
  }

  // Module 3: Elite Strike
  if (config.module3Enabled) {
    const level = config.module3Level;
    if (level === "5") {
      bossDmg += 3.9;
    } else if (level === "6") {
      bossDmg += 6.6;
    }
  }

  // Module 4: Crit Focus
  if (config.module4Enabled) {
    const level = config.module4Level;
    if (level === "3") {
      elemBonus += 0.44;
    } else if (level === "4") {
      elemBonus += 0.88;
    } else if (level === "5") {
      elemBonus += 1.32;
      critDmg += 7.1;
    } else if (level === "6") {
      elemBonus += 1.76;
      critDmg += 12;
    }
  }

  // Module 5: Extreme Damage Stacking (High Attack Power)
  if (config.module5Enabled) {
    const level = config.module5Level;
    if (level === "5") {
      vulnDmg += 6.6;
    } else if (level === "6") {
      vulnDmg += 11;
    }
  }

  // Module 6: Extreme Flexible Movement (Note: High Attack Power)
  let physAtkMultiplier = 1;
  if (config.module6Enabled) {
    const level = config.module6Level;
    if (level === "5") {
      physAtkMultiplier = 1.06;
    } else if (level === "6") {
      physAtkMultiplier = 1.1;
    }
  }
  physAtk *= physAtkMultiplier;

  // Apply buff system effects
  // Buff template 3: Poisonous Hive
  if (config.buff3Enabled) {
    const buffValue = parseFloat(config.buff3Value) || 0;
    vulnDmg += buffValue;
  }

  // Buff template 4: Bandit Leader
  if (config.buff4Enabled) {
    const buffValue = parseFloat(config.buff4Value) || 1;
    physAtk *= buffValue;
  }

  // Calculate defense correction factor
  let defenseFactor = 6500 / (monsterDefense + 6500);
  let critDefenseFactor = defenseFactor;
  if (activeSkill === 1 && talent6) {
    critDefenseFactor = 6500 / (monsterDefense * 0.7 + 6500);
  }

  // Calculate Thunder Seal damage increase ratio
  const thunderSealMulti = talent3 ? 0.28 : 0.25;

  // Calculate various coefficients
  const baseAttackNonCrit = physAtk * defenseFactor + elemAtk + refineAtk;
  const baseAttackCrit = physAtk * critDefenseFactor + elemAtk + refineAtk;
  const skillMultiplier = skillMulti / 100;
  const thunderMasteryMulti = 1 + thunderSeal * thunderSealMulti + mastery * 0.025;

  // Common multiplier for normal targets
  const normalPublicMultiplier = 1 + (meleeDmg + currentBossDmg + vulnDmg + skillDmg + physDmg) / 100;

  const elementMultiplier = 1 + elemBonus / 100;
  const allRoundMultiplier = 1 + allRound * 0.0035;
  let critDmgMultiplier = 1 + critDmg / 100;

  // Talent 2: Excess crit is converted to crit damage
  if (activeSkill === 1 && talent2 && critRate > 65.28) {
    const excessCrit = critRate - 65.28;
    critDmgMultiplier += excessCrit / 100;
  }

  // Calculate base damage (single hit)
  const baseDamageNonCrit = baseAttackNonCrit * skillMultiplier * thunderMasteryMulti + skillAdd;
  const baseDamageCrit = baseAttackCrit * skillMultiplier * thunderMasteryMulti + skillAdd;

  // Calculate normal target damage (single hit)
  const nonCritDamage = baseDamageNonCrit * normalPublicMultiplier * elementMultiplier * allRoundMultiplier;
  const critDamage = baseDamageCrit * normalPublicMultiplier * elementMultiplier * allRoundMultiplier * critDmgMultiplier;

  // Calculate expected damage
  const expectedDamage = nonCritDamage * (1 - Math.min(100, critRate) / 100) + critDamage * (Math.min(100, critRate) / 100);

  return {
    nonCritDamage: nonCritDamage.toFixed(1),
    critDamage: critDamage.toFixed(1),
    expectedDamage: expectedDamage.toFixed(1),
    finalCritRate: critRate.toFixed(2) + "%",
  };
}

module.exports = calculateDamage;
