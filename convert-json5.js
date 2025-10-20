const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const prompts = require('prompts');

async function main() {
    const configDir = 'config';
    const files = fs.readdirSync(configDir).filter(file => file.endsWith('.json5'));
    if (files.length === 0) {
        console.log('config 目录下没有找到 .json5 文件');
        return;
    }

    const choices = files.map(file => ({ title: file, value: file }));
    const response = await prompts({
        type: 'select',
        name: 'file',
        message: '选择要转换的 JSON5 文件',
        choices: choices
    });

    if (!response.file) {
        console.log('已取消');
        return;
    }

    const inputPath = path.join(configDir, response.file);
    const outputPath = path.join(configDir, response.file.replace('.json5', '.json'));
    const data = fs.readFileSync(inputPath, 'utf8');
    const obj = JSON5.parse(data);
    const json = JSON.stringify(obj, null, 2);
    fs.writeFileSync(outputPath, json);
    console.log(`转换完成：${outputPath}`);
}

main();
