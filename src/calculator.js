/**
 * 基于index.html中的calculateDamage函数实现
 */

const JSON5 = require('json5');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const calculateDamage = require('./calculateDamage')

const defaultHistoryPath = "../damage_history.json5"

// 扫描配置文件
function scanConfigFiles() {
  const configDir = './config';
  const configFiles = [];

  try {
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      files.forEach(file => {
        if (file.endsWith('.json5') || file.endsWith('.json')) {
          configFiles.push({
            name: file,
            path: path.join(configDir, file),
            displayName: getConfigDisplayName(file)
          });
        }
      });
    }
  } catch (error) {
    console.warn(`扫描配置文件目录失败: ${error.message}`);
  }

  return configFiles;
}

// 获取配置文件显示名称
function getConfigDisplayName(filename) {
  const configPath = path.join('./config', filename);

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf8");
      const config = JSON5.parse(configData);

      // 从配置文件中读取 name 字段，如果没有则返回空字符串
      return config.name || "";
    }
  } catch (error) {
    console.warn(`读取配置文件 ${filename} 失败: ${error.message}`);
  }

  // 如果读取失败，返回空字符串
  return "";
}

// 读取配置文件
function loadConfig(configPath = "config/normal80.json5") {
  if (!fs.existsSync(configPath)) {
    console.error(`配置文件 ${configPath} 不存在`);
    return null;
  }

  try {
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON5.parse(configData);
  } catch (error) {
    console.error(`读取配置文件失败: ${error.message}`);
    return null;
  }
}

// 读取历史记录
function loadHistory(historyPath = defaultHistoryPath) {
  const fs = require("fs");

  if (!fs.existsSync(historyPath)) {
    return null;
  }

  try {
    const historyData = fs.readFileSync(historyPath, "utf8");
    return JSON5.parse(historyData);
  } catch (error) {
    console.error(`读取历史记录失败: ${error.message}`);
    return null;
  }
}

// 保存历史记录
function saveHistory(result, historyPath = defaultHistoryPath) {
  const fs = require("fs");

  const history = {
    timestamp: new Date().toISOString(),
    nonCritDamage: result.nonCritDamage,
    critDamage: result.critDamage,
    expectedDamage: result.expectedDamage,
    critRate: result.critRate
  };

  try {
    fs.writeFileSync(historyPath, JSON5.stringify(history, null, 2));
    console.log(`历史记录已保存到 ${historyPath}`);
  } catch (error) {
    console.error(`保存历史记录失败: ${error.message}`);
  }
}


// 配置文件选择界面
async function selectConfig() {
  console.log("🔧 === 伤害计算器配置文件选择 ===\n");

  const configFiles = scanConfigFiles();

  if (configFiles.length === 0) {
    console.log("⚠️  未找到配置文件，使用默认配置");
    return "config/normal80.json5";
  }

  // 构建选择菜单
  const choices = [];

  // 添加配置文件选项
  configFiles.forEach((config, index) => {
    choices.push({
      title: `${index + 1}. ${config.name} (${config.displayName})`,
      value: config.path,
      description: `选择 ${config.displayName} 配置文件`
    });
  });

  // 添加其他选项
  choices.push(
    {
      title: `${configFiles.length + 1}. 自定义配置文件路径`,
      value: 'custom',
      description: '输入自定义配置文件路径'
    },
    {
      title: `${configFiles.length + 2}. 使用默认配置`,
      value: 'default',
      description: '使用默认配置文件 (config/normal80.json5)'
    },
    {
      title: `${configFiles.length + 3}. 退出程序`,
      value: 'exit',
      description: '退出伤害计算器'
    }
  );

  try {
    const response = await prompts({
      type: 'select',
      name: 'selectedConfig',
      message: '请选择配置文件：',
      choices: choices,
      initial: 0,
      hint: '使用方向键移动，回车选择'
    });

    const selectedConfig = response.selectedConfig;

    if (!selectedConfig) {
      console.log("\n⚠️  未选择任何选项，使用默认配置\n");
      return "config/normal80.json5";
    }

    if (selectedConfig === 'exit') {
      console.log("\n👋 再见！\n");
      process.exit(0);
    }

    if (selectedConfig === 'default') {
      console.log("\n✅ 使用默认配置: config/normal80.json5\n");
      return "config/normal80.json5";
    }

    if (selectedConfig === 'custom') {
      console.log("");
      const customResponse = await prompts({
        type: 'text',
        name: 'customPath',
        message: '请输入配置文件路径：',
        validate: (input) => {
          if (!input.trim()) {
            return '配置文件路径不能为空';
          }
          if (!fs.existsSync(input.trim())) {
            return `文件不存在: ${input.trim()}`;
          }
          return true;
        }
      });

      const customPath = customResponse.customPath;
      if (!customPath) {
        console.log("\n❌ 未输入路径，使用默认配置\n");
        return "config/normal80.json5";
      }

      console.log(`\n✅ 使用自定义配置: ${customPath}\n`);
      return customPath;
    }

    // 选择现有配置文件
    const selectedFile = configFiles.find(config => config.path === selectedConfig);
    console.log(`\n✅ 已选择配置: ${selectedFile.name} (${selectedFile.displayName})\n`);
    return selectedConfig;

  } catch (error) {
    console.log("\n❌ 配置选择出错，使用默认配置");
    console.error(error.message);
    return "config/normal80.json5";
  }
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
async function main() {
  try {
    // 配置文件选择
    const configPath = await selectConfig();

    // 加载选定的配置
    const config = loadConfig(configPath);
    if (!config) {
      console.error(`❌ 无法加载配置文件: ${configPath}`);
      return null;
    }

    console.log("开始计算伤害...\n");

    // 读取历史记录用于比较
    const historyResult = loadHistory();

    // 使用选定的配置进行伤害计算
    const result = calculateDamage(config);

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
  } catch (error) {
    console.error("❌ 程序执行出错:", error.message);
    return null;
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error("❌ 主函数执行失败:", error);
    process.exit(1);
  });
}

module.exports = {
  calculateDamage,
  loadConfig,
  main,
  getConfigDisplayName,
};
