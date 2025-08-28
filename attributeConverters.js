/**
 * 属性换算公式汇总
 * 包含各种游戏属性的换算公式和计算工具
 */

// 常量定义
const CONVERSION_CONSTANTS = {
    CRIT_RATIO_DIVISOR: 4458.1,
    LUCK_RATIO_DIVISOR: 4458.1,
    HASTE_RATIO_DIVISOR: 4458.1,
    MASTERY_RATIO_DIVISOR: 4458.1,
    VERSATILITY_RATIO_DIVISOR: 2501.1,
    ELEMENT_RATIO_DIVISOR: 4458.1,
    BASE_CRIT_PERCENT: 5,
    BASE_LUCK_PERCENT: 5,
    BASE_MASTERY_PERCENT: 6,
    AGILITY_TO_ATTACK_RATIO: 0.725,
    STAMINA_TO_HP_RATIO: 7.8,
    ALL_ELEMENT_RATIO: 2.2,
    ATTACK_SPEED_RATIO: 1.6
};

/**
 * 工具函数
 */
const utils = {
    /**
     * 验证数值输入
     * @param {number} value - 要验证的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {boolean} 是否有效
     */
    validateInput: (value, min = 0, max = Infinity) => {
        return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
    },

    /**
     * 格式化数值输出
     * @param {number} value - 要格式化的值
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的字符串
     */
    formatNumber: (value, decimals = 1) => {
        return value.toFixed(decimals);
    },

    /**
     * 计算比率公式: [value / (value + divisor)] * 100
     * @param {number} value - 属性值
     * @param {number} divisor - 除数
     * @param {number} basePercent - 基础百分比
     * @returns {number} 计算结果百分比
     */
    calculateRatio: (value, divisor, basePercent = 0) => {
        if (!utils.validateInput(value, 0)) return 0;
        return (value / (value + divisor)) * 100 + basePercent;
    },

    /**
     * 反向计算比率: 根据百分比计算属性值
     * @param {number} percent - 百分比
     * @param {number} divisor - 除数
     * @param {number} basePercent - 基础百分比
     * @returns {number} 属性值
     */
    reverseRatio: (percent, divisor, basePercent = 0) => {
        if (!utils.validateInput(percent, basePercent, 100 + basePercent)) return 0;
        const adjustedPercent = (percent - basePercent) / 100;
        return (adjustedPercent * divisor) / (1 - adjustedPercent);
    }
};

/**
 * 物理攻击换算
 */
const physicalAttack = {
    /**
     * 计算物理攻击: (敏捷 × 0.725 + 武器攻击 + 模组攻击) × (1 + 攻击加成%)
     * @param {number} agility - 敏捷值
     * @param {number} weaponAtk - 武器攻击
     * @param {number} moduleAtk - 模组攻击
     * @param {number} atkBonus - 攻击加成百分比
     * @returns {number} 物理攻击值
     */
    calculate: (agility, weaponAtk, moduleAtk, atkBonus) => {
        if (!utils.validateInput(agility, 0) || !utils.validateInput(weaponAtk, 0) ||
            !utils.validateInput(moduleAtk, 0) || !utils.validateInput(atkBonus, -100)) {
            return 0;
        }

        const baseAtk = agility * CONVERSION_CONSTANTS.AGILITY_TO_ATTACK_RATIO + weaponAtk + moduleAtk;
        return baseAtk * (1 + atkBonus / 100);
    },

    /**
     * 反向计算敏捷值
     * @param {number} physicalAtk - 物理攻击值
     * @param {number} weaponAtk - 武器攻击
     * @param {number} moduleAtk - 模组攻击
     * @param {number} atkBonus - 攻击加成百分比
     * @returns {number} 敏捷值
     */
    reverseToAgility: (physicalAtk, weaponAtk, moduleAtk, atkBonus) => {
        if (!utils.validateInput(physicalAtk, 0) || !utils.validateInput(atkBonus, -100, 1000) ||
            physicalAtk <= 0) {
            return 0;
        }

        const baseAtk = physicalAtk / (1 + atkBonus / 100);
        const agility = (baseAtk - weaponAtk - moduleAtk) / CONVERSION_CONSTANTS.AGILITY_TO_ATTACK_RATIO;

        return Math.max(0, agility);
    }
};

/**
 * 暴击换算
 */
const crit = {
    /**
     * 计算总暴击%: [暴击 / (暴击 + 4458.1)] × 100% + 5%
     * @param {number} critValue - 暴击值
     * @param {boolean} pursuitActive - 是否启用追击风袭
     * @returns {number} 总暴击百分比
     */
    calculate: (critValue, pursuitActive = false) => {
        if (!utils.validateInput(critValue, 0)) return CONVERSION_CONSTANTS.BASE_CRIT_PERCENT;

        let result = utils.calculateRatio(critValue, CONVERSION_CONSTANTS.CRIT_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_CRIT_PERCENT);

        // 追击风袭效果: 总暴击% × 1.24
        if (pursuitActive) {
            result *= 1.24;
        }

        return result;
    },

    /**
     * 反向计算暴击值
     * @param {number} totalCritPercent - 总暴击百分比
     * @param {boolean} pursuitActive - 是否启用追击风袭
     * @returns {number} 暴击值
     */
    reverse: (totalCritPercent, pursuitActive = false) => {
        if (!utils.validateInput(totalCritPercent, CONVERSION_CONSTANTS.BASE_CRIT_PERCENT, 200)) return 0;

        let adjustedPercent = totalCritPercent;

        // 追击风袭反向计算
        if (pursuitActive) {
            adjustedPercent /= 1.24;
        }

        return utils.reverseRatio(adjustedPercent, CONVERSION_CONSTANTS.CRIT_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_CRIT_PERCENT);
    }
};

/**
 * 幸运换算
 */
const luck = {
    /**
     * 计算总幸运%: [幸运 / (幸运 + 4458.1)] × 100% + 5%
     * @param {number} luckValue - 幸运值
     * @param {boolean} pursuitActive - 是否启用追击风袭
     * @returns {number} 总幸运百分比
     */
    calculate: (luckValue, pursuitActive = false) => {
        if (!utils.validateInput(luckValue, 0)) return CONVERSION_CONSTANTS.BASE_LUCK_PERCENT;

        let result = utils.calculateRatio(luckValue, CONVERSION_CONSTANTS.LUCK_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_LUCK_PERCENT);

        // 追击风袭效果: 总幸运% × 0.8
        if (pursuitActive) {
            result *= 0.8;
        }

        return result;
    },

    /**
     * 反向计算幸运值
     * @param {number} totalLuckPercent - 总幸运百分比
     * @param {boolean} pursuitActive - 是否启用追击风袭
     * @returns {number} 幸运值
     */
    reverse: (totalLuckPercent, pursuitActive = false) => {
        if (!utils.validateInput(totalLuckPercent, CONVERSION_CONSTANTS.BASE_LUCK_PERCENT, 200)) return 0;

        let adjustedPercent = totalLuckPercent;

        // 追击风袭反向计算
        if (pursuitActive) {
            adjustedPercent /= 0.8;
        }

        return utils.reverseRatio(adjustedPercent, CONVERSION_CONSTANTS.LUCK_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_LUCK_PERCENT);
    }
};

/**
 * 急速与攻速换算
 */
const haste = {
    /**
     * 计算总急速%: [急速 / (急速 + 4458.1)] × 100% + 基础急速%
     * @param {number} hasteValue - 急速值
     * @param {number} baseHaste - 基础急速百分比
     * @returns {number} 总急速百分比
     */
    calculateTotalHaste: (hasteValue, baseHaste = 0) => {
        if (!utils.validateInput(hasteValue, 0) || !utils.validateInput(baseHaste, 0, 100)) {
            return baseHaste;
        }

        return utils.calculateRatio(hasteValue, CONVERSION_CONSTANTS.HASTE_RATIO_DIVISOR, baseHaste);
    },

    /**
     * 计算攻速%: 总急速% × 1.6
     * @param {number} totalHastePercent - 总急速百分比
     * @returns {number} 攻速百分比
     */
    calculateAttackSpeed: (totalHastePercent) => {
        if (!utils.validateInput(totalHastePercent, 0, 200)) return 0;
        return totalHastePercent * CONVERSION_CONSTANTS.ATTACK_SPEED_RATIO;
    },

    /**
     * 反向计算急速值（从总急速%）
     * @param {number} totalHastePercent - 总急速百分比
     * @param {number} baseHaste - 基础急速百分比
     * @returns {number} 急速值
     */
    reverseFromTotalHaste: (totalHastePercent, baseHaste = 0) => {
        if (!utils.validateInput(totalHastePercent, baseHaste, 200)) return 0;
        return utils.reverseRatio(totalHastePercent, CONVERSION_CONSTANTS.HASTE_RATIO_DIVISOR, baseHaste);
    },

    /**
     * 反向计算急速值（从攻速%）
     * @param {number} attackSpeedPercent - 攻速百分比
     * @param {number} baseHaste - 基础急速百分比
     * @returns {number} 急速值
     */
    reverseFromAttackSpeed: (attackSpeedPercent, baseHaste = 0) => {
        if (!utils.validateInput(attackSpeedPercent, 0, 320)) return 0;
        const totalHastePercent = attackSpeedPercent / CONVERSION_CONSTANTS.ATTACK_SPEED_RATIO;
        return utils.reverseRatio(totalHastePercent, CONVERSION_CONSTANTS.HASTE_RATIO_DIVISOR, baseHaste);
    }
};

/**
 * 精通换算
 */
const mastery = {
    /**
     * 计算总精通%: [精通 / (精通 + 4458.1)] × 100% + 6%
     * @param {number} masteryValue - 精通值
     * @returns {number} 总精通百分比
     */
    calculate: (masteryValue) => {
        if (!utils.validateInput(masteryValue, 0)) return CONVERSION_CONSTANTS.BASE_MASTERY_PERCENT;
        return utils.calculateRatio(masteryValue, CONVERSION_CONSTANTS.MASTERY_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_MASTERY_PERCENT);
    },

    /**
     * 反向计算精通值
     * @param {number} totalMasteryPercent - 总精通百分比
     * @returns {number} 精通值
     */
    reverse: (totalMasteryPercent) => {
        if (!utils.validateInput(totalMasteryPercent, CONVERSION_CONSTANTS.BASE_MASTERY_PERCENT, 106)) return 0;
        return utils.reverseRatio(totalMasteryPercent, CONVERSION_CONSTANTS.MASTERY_RATIO_DIVISOR, CONVERSION_CONSTANTS.BASE_MASTERY_PERCENT);
    }
};

/**
 * 全能换算
 */
const versatility = {
    /**
     * 计算总全能%: [全能 / (全能 + 2501.1)] × 100%
     * @param {number} versatilityValue - 全能值
     * @returns {number} 总全能百分比
     */
    calculate: (versatilityValue) => {
        if (!utils.validateInput(versatilityValue, 0)) return 0;
        return utils.calculateRatio(versatilityValue, CONVERSION_CONSTANTS.VERSATILITY_RATIO_DIVISOR, 0);
    },

    /**
     * 反向计算全能值
     * @param {number} totalVersatilityPercent - 总全能百分比
     * @returns {number} 全能值
     */
    reverse: (totalVersatilityPercent) => {
        if (!utils.validateInput(totalVersatilityPercent, 0, 100)) return 0;
        return utils.reverseRatio(totalVersatilityPercent, CONVERSION_CONSTANTS.VERSATILITY_RATIO_DIVISOR, 0);
    }
};

/**
 * 生命上限换算
 */
const health = {
    /**
     * 计算总生命上限: 耐力 × 7.8 + 生命上限基础值
     * @param {number} stamina - 耐力值
     * @param {number} hpBase - 生命上限基础值
     * @returns {number} 总生命上限
     */
    calculate: (stamina, hpBase) => {
        if (!utils.validateInput(stamina, 0) || !utils.validateInput(hpBase, 0)) return hpBase;
        return stamina * CONVERSION_CONSTANTS.STAMINA_TO_HP_RATIO + hpBase;
    },

    /**
     * 反向计算耐力值
     * @param {number} totalHp - 总生命上限
     * @param {number} hpBase - 生命上限基础值
     * @returns {number} 耐力值
     */
    reverse: (totalHp, hpBase) => {
        if (!utils.validateInput(totalHp, hpBase) || totalHp < hpBase) return 0;
        return (totalHp - hpBase) / CONVERSION_CONSTANTS.STAMINA_TO_HP_RATIO;
    }
};

/**
 * 元素加成换算
 */
const element = {
    /**
     * 计算元素加成%: [元素强度 / (元素强度 + 4458.1)] × 100%
     * @param {number} elementPower - 元素强度
     * @returns {number} 元素加成百分比
     */
    calculate: (elementPower) => {
        if (!utils.validateInput(elementPower, 0)) return 0;
        return utils.calculateRatio(elementPower, CONVERSION_CONSTANTS.ELEMENT_RATIO_DIVISOR, 0);
    },

    /**
     * 反向计算元素强度
     * @param {number} elementBonusPercent - 元素加成百分比
     * @returns {number} 元素强度
     */
    reverse: (elementBonusPercent) => {
        if (!utils.validateInput(elementBonusPercent, 0, 100)) return 0;
        return utils.reverseRatio(elementBonusPercent, CONVERSION_CONSTANTS.ELEMENT_RATIO_DIVISOR, 0);
    }
};

/**
 * 全元素加成换算
 */
const allElement = {
    /**
     * 计算全元素加成%: 全元素强度 × 2.2%
     * @param {number} allElementPower - 全元素强度
     * @returns {number} 全元素加成百分比
     */
    calculate: (allElementPower) => {
        if (!utils.validateInput(allElementPower, 0)) return 0;
        return allElementPower * CONVERSION_CONSTANTS.ALL_ELEMENT_RATIO / 100;
    },

    /**
     * 反向计算全元素强度
     * @param {number} allElementBonusPercent - 全元素加成百分比
     * @returns {number} 全元素强度
     */
    reverse: (allElementBonusPercent) => {
        if (!utils.validateInput(allElementBonusPercent, 0)) return 0;
        return (allElementBonusPercent / CONVERSION_CONSTANTS.ALL_ELEMENT_RATIO) * 100;
    }
};

/**
 * 批量计算工具
 */
const batchCalculator = {
    /**
     * 计算所有属性
     * @param {Object} attributes - 属性对象
     * @param {Object} options - 选项
     * @returns {Object} 计算结果
     */
    calculateAll: (attributes, options = {}) => {
        const pursuitActive = options.pursuitActive || false;

        return {
            physicalAttack: physicalAttack.calculate(
                attributes.agility || 0,
                attributes.weaponAtk || 0,
                attributes.moduleAtk || 0,
                attributes.atkBonus || 0
            ),
            critPercent: crit.calculate(attributes.crit || 0, pursuitActive),
            luckPercent: luck.calculate(attributes.luck || 0, pursuitActive),
            hastePercent: haste.calculateTotalHaste(attributes.haste || 0, attributes.baseHaste || 0),
            attackSpeedPercent: haste.calculateAttackSpeed(
                haste.calculateTotalHaste(attributes.haste || 0, attributes.baseHaste || 0)
            ),
            masteryPercent: mastery.calculate(attributes.mastery || 0),
            versatilityPercent: versatility.calculate(attributes.versatility || 0),
            totalHp: health.calculate(attributes.stamina || 0, attributes.hpBase || 0),
            elementBonusPercent: element.calculate(attributes.elementPower || 0),
            allElementBonusPercent: allElement.calculate(attributes.allElementPower || 0)
        };
    },

    /**
     * 验证所有输入
     * @param {Object} attributes - 属性对象
     * @returns {Object} 验证结果
     */
    validateAll: (attributes) => {
        const errors = [];

        // 物理攻击相关验证
        if (attributes.agility !== undefined && !utils.validateInput(attributes.agility, 0)) {
            errors.push('敏捷值必须大于等于0');
        }
        if (attributes.weaponAtk !== undefined && !utils.validateInput(attributes.weaponAtk, 0)) {
            errors.push('武器攻击必须大于等于0');
        }
        if (attributes.moduleAtk !== undefined && !utils.validateInput(attributes.moduleAtk, 0)) {
            errors.push('模组攻击必须大于等于0');
        }
        if (attributes.atkBonus !== undefined && !utils.validateInput(attributes.atkBonus, -100)) {
            errors.push('攻击加成%必须大于等于-100');
        }

        // 暴击验证
        if (attributes.crit !== undefined && !utils.validateInput(attributes.crit, 0)) {
            errors.push('暴击值必须大于等于0');
        }

        // 幸运验证
        if (attributes.luck !== undefined && !utils.validateInput(attributes.luck, 0)) {
            errors.push('幸运值必须大于等于0');
        }

        // 急速验证
        if (attributes.haste !== undefined && !utils.validateInput(attributes.haste, 0)) {
            errors.push('急速值必须大于等于0');
        }
        if (attributes.baseHaste !== undefined && !utils.validateInput(attributes.baseHaste, 0, 100)) {
            errors.push('基础急速%必须在0-100之间');
        }

        // 精通验证
        if (attributes.mastery !== undefined && !utils.validateInput(attributes.mastery, 0)) {
            errors.push('精通值必须大于等于0');
        }

        // 全能验证
        if (attributes.versatility !== undefined && !utils.validateInput(attributes.versatility, 0)) {
            errors.push('全能值必须大于等于0');
        }

        // 生命验证
        if (attributes.stamina !== undefined && !utils.validateInput(attributes.stamina, 0)) {
            errors.push('耐力值必须大于等于0');
        }
        if (attributes.hpBase !== undefined && !utils.validateInput(attributes.hpBase, 0)) {
            errors.push('生命上限基础值必须大于等于0');
        }

        // 元素验证
        if (attributes.elementPower !== undefined && !utils.validateInput(attributes.elementPower, 0)) {
            errors.push('元素强度必须大于等于0');
        }
        if (attributes.allElementPower !== undefined && !utils.validateInput(attributes.allElementPower, 0)) {
            errors.push('全元素强度必须大于等于0');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// 导出所有模块
module.exports = {
    CONVERSION_CONSTANTS,
    utils,
    physicalAttack,
    crit,
    luck,
    haste,
    mastery,
    versatility,
    health,
    element,
    allElement,
    batchCalculator
};

// 如果在浏览器环境中使用
if (typeof window !== 'undefined') {
    window.AttributeConverters = module.exports;
}
