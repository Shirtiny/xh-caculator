# 属性换算公式库 (attributeConverters.js)


## 功能特性

- ✅ **完整的属性换算公式**：涵盖物理攻击、暴击、幸运、急速、精通、全能、生命、元素等所有主要属性
- ✅ **双向计算**：支持正向计算（属性值→百分比）和反向计算（百分比→属性值）
- ✅ **特殊效果支持**：支持追击风袭等特殊效果的计算
- ✅ **批量计算**：支持一次性计算多个属性
- ✅ **输入验证**：自动验证输入数据的有效性
- ✅ **模块化设计**：代码结构清晰，易于维护和扩展
- ✅ **跨平台兼容**：支持Node.js环境和浏览器环境

## 文件结构

```
attributeConverters.js      # 主库文件
testConverters.js           # 测试文件
README_attributeConverters.md  # 使用说明
```

## 安装使用

### Node.js环境

```javascript
const converters = require('./attributeConverters');

// 使用示例
const physicalAtk = converters.physicalAttack.calculate(2000, 500, 300, 10);
console.log(`物理攻击: ${physicalAtk}`); // 输出: 物理攻击: 2475
```

### 浏览器环境

```html
<script src="attributeConverters.js"></script>
<script>
    // 库已自动注册为全局变量 window.AttributeConverters
    const converters = window.AttributeConverters;

    const physicalAtk = converters.physicalAttack.calculate(2000, 500, 300, 10);
    console.log(`物理攻击: ${physicalAtk}`);
</script>
```

## API 文档

### 常量定义

```javascript
CONVERSION_CONSTANTS = {
    CRIT_RATIO_DIVISOR: 4458.1,          // 暴击比率除数
    LUCK_RATIO_DIVISOR: 4458.1,         // 幸运比率除数
    HASTE_RATIO_DIVISOR: 4458.1,        // 急速比率除数
    MASTERY_RATIO_DIVISOR: 4458.1,      // 精通比率除数
    VERSATILITY_RATIO_DIVISOR: 2501.1,  // 全能比率除数
    ELEMENT_RATIO_DIVISOR: 4458.1,      // 元素比率除数
    BASE_CRIT_PERCENT: 5,               // 基础暴击百分比
    BASE_LUCK_PERCENT: 5,               // 基础幸运百分比
    BASE_MASTERY_PERCENT: 6,            // 基础精通百分比
    AGILITY_TO_ATTACK_RATIO: 0.725,     // 敏捷转攻击比率
    STAMINA_TO_HP_RATIO: 7.8,           // 耐力转生命比率
    ALL_ELEMENT_RATIO: 2.2,             // 全元素比率
    ATTACK_SPEED_RATIO: 1.6             // 攻速比率
}
```

### 物理攻击换算

```javascript
// 计算物理攻击
const result = converters.physicalAttack.calculate(agility, weaponAtk, moduleAtk, atkBonus);

// 参数说明:
// agility: 敏捷值
// weaponAtk: 武器攻击
// moduleAtk: 模组攻击
// atkBonus: 攻击加成百分比

// 反向计算敏捷值
const agility = converters.physicalAttack.reverseToAgility(physicalAtk, weaponAtk, moduleAtk, atkBonus);
```

**计算公式**: `(敏捷 × 0.725 + 武器攻击 + 模组攻击) × (1 + 攻击加成%)`

### 暴击换算

```javascript
// 计算总暴击%
const result = converters.crit.calculate(critValue, pursuitActive);

// 反向计算暴击值
const critValue = converters.crit.reverse(totalCritPercent, pursuitActive);
```

**计算公式**: `[暴击 / (暴击 + 4458.1)] × 100% + 5%`
**追击风袭效果**: `总暴击% × 1.24`

### 幸运换算

```javascript
// 计算总幸运%
const result = converters.luck.calculate(luckValue, pursuitActive);

// 反向计算幸运值
const luckValue = converters.luck.reverse(totalLuckPercent, pursuitActive);
```

**计算公式**: `[幸运 / (幸运 + 4458.1)] × 100% + 5%`
**追击风袭效果**: `总幸运% × 0.8`

### 急速与攻速换算

```javascript
// 计算总急速%
const totalHaste = converters.haste.calculateTotalHaste(hasteValue, baseHaste);

// 计算攻速%
const attackSpeed = converters.haste.calculateAttackSpeed(totalHaste);

// 反向计算急速值（从总急速%）
const hasteValue1 = converters.haste.reverseFromTotalHaste(totalHastePercent, baseHaste);

// 反向计算急速值（从攻速%）
const hasteValue2 = converters.haste.reverseFromAttackSpeed(attackSpeedPercent, baseHaste);
```

**计算公式**:
- 总急速%: `[急速 / (急速 + 4458.1)] × 100% + 基础急速%`
- 攻速%: `总急速% × 1.6`

### 精通换算

```javascript
// 计算总精通%
const result = converters.mastery.calculate(masteryValue);

// 反向计算精通值
const masteryValue = converters.mastery.reverse(totalMasteryPercent);
```

**计算公式**: `[精通 / (精通 + 4458.1)] × 100% + 6%`

### 全能换算

```javascript
// 计算总全能%
const result = converters.versatility.calculate(versatilityValue);

// 反向计算全能值
const versatilityValue = converters.versatility.reverse(totalVersatilityPercent);
```

**计算公式**: `[全能 / (全能 + 2501.1)] × 100%`

### 生命上限换算

```javascript
// 计算总生命上限
const result = converters.health.calculate(stamina, hpBase);

// 反向计算耐力值
const stamina = converters.health.reverse(totalHp, hpBase);
```

**计算公式**: `耐力 × 7.8 + 生命上限基础值`

### 元素加成换算

```javascript
// 计算元素加成%
const result = converters.element.calculate(elementPower);

// 反向计算元素强度
const elementPower = converters.element.reverse(elementBonusPercent);
```

**计算公式**: `[元素强度 / (元素强度 + 4458.1)] × 100%`

### 全元素加成换算

```javascript
// 计算全元素加成%
const result = converters.allElement.calculate(allElementPower);

// 反向计算全元素强度
const allElementPower = converters.allElement.reverse(allElementBonusPercent);
```

**计算公式**: `全元素强度 × 2.2%`

### 批量计算工具

```javascript
// 批量计算所有属性
const results = converters.batchCalculator.calculateAll(attributes, options);

// 参数说明:
// attributes: 属性对象，包含所有需要计算的属性值
// options: 选项对象
//   - pursuitActive: 是否启用追击风袭效果 (boolean)

// 示例:
const attributes = {
    agility: 2000,
    weaponAtk: 500,
    moduleAtk: 300,
    atkBonus: 10,
    crit: 3000,
    luck: 2500,
    haste: 1800,
    baseHaste: 5,
    mastery: 3500,
    versatility: 4000,
    stamina: 1500,
    hpBase: 10000,
    elementPower: 2800,
    allElementPower: 2200
};

const results = converters.batchCalculator.calculateAll(attributes, {
    pursuitActive: false
});

console.log(results);
// 输出:
// {
//   physicalAttack: 2475,
//   critPercent: 45.22,
//   luckPercent: 40.93,
//   hastePercent: 33.76,
//   attackSpeedPercent: 54.02,
//   masteryPercent: 49.98,
//   versatilityPercent: 61.53,
//   totalHp: 21700,
//   elementBonusPercent: 38.58,
//   allElementBonusPercent: 48.40
// }
```

### 输入验证

```javascript
// 验证所有输入
const validation = converters.batchCalculator.validateAll(attributes);

if (validation.isValid) {
    console.log('所有输入有效');
} else {
    console.log('发现错误:');
    validation.errors.forEach(error => console.log(`- ${error}`));
}
```

## 使用示例

### 基本使用

```javascript
const converters = require('./attributeConverters');

// 计算单个属性
const critPercent = converters.crit.calculate(3000);
console.log(`暴击%: ${critPercent.toFixed(2)}%`); // 输出: 暴击%: 45.22%

// 批量计算
const attributes = {
    crit: 3000,
    luck: 2500,
    mastery: 3500,
    versatility: 4000
};

const results = converters.batchCalculator.calculateAll(attributes);
console.log(results);
```

### 特殊效果计算

```javascript
// 开启追击风袭效果
const critWithPursuit = converters.crit.calculate(3000, true);
const luckWithPursuit = converters.luck.calculate(2500, true);

console.log(`开启追击风袭:`);
console.log(`暴击%: ${critWithPursuit.toFixed(2)}%`); // 输出: 56.08%
console.log(`幸运%: ${luckWithPursuit.toFixed(2)}%`); // 输出: 32.74%
```

### 反向计算

```javascript
// 已知暴击%，计算需要多少暴击值
const requiredCritValue = converters.crit.reverse(50);
console.log(`达到50%暴击%需要暴击值: ${requiredCritValue.toFixed(0)}`);

// 已知攻速%，计算需要多少急速值
const requiredHasteValue = converters.haste.reverseFromAttackSpeed(60, 5);
console.log(`达到60%攻速%需要急速值: ${requiredHasteValue.toFixed(0)}`);
```

## 注意事项

1. **数值精度**: 所有计算结果保留1位小数，测试显示反向计算误差在0.1以内
2. **输入验证**: 建议在使用前验证输入数据的有效性
3. **特殊效果**: 某些属性会受到特殊效果影响，请根据实际游戏情况选择是否启用
4. **公式准确性**: 所有公式基于游戏机制实现，如有更新请及时调整
