const fs = require('fs');
const { Transform } = require('stream');

const sourcePath = 'blue-protocol/index.html';
const destinationPath = 'blue-protocol/extracted_data.txt';

// 创建一个转换流来移除HTML标签
const htmlRemover = new Transform({
  transform(chunk, encoding, callback) {
    // 将块转换为字符串，移除HTML标签，并进行一些基本的清理
    const textChunk = chunk.toString()
      .replace(/&lt;script\\b[^&gt;]*&gt;[\\s\\S]*?&lt;\\\/script&gt;/gi, '') // 移除script标签及其内容
      .replace(/&lt;style\\b[^&gt;]*&gt;[\\s\\S]*?&lt;\\\/style&gt;/gi, '')  // 移除style标签及其内容
      .replace(/&lt;[^&gt;]*&gt;/g, '\\n') // 用换行符替换HTML标签
      .replace(/(\\n\\s*){3,}/g, '\\n\\n') // 将三个及以上的连续换行符（及其中间的空白）合并为两个换行符
      .trim(); // 替换 .replace(/^\\s+|\\s+$/g, '')

    // 将处理后的块推送到下一个流
    this.push(textChunk);
    callback();
  }
});

// 创建可读和可写流
const readableStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });
const writableStream = fs.createWriteStream(destinationPath, { encoding: 'utf8' });

// 设置错误处理
readableStream.on('error', (err) => {
  console.error('读取文件时发生错误:', err);
});

writableStream.on('error', (err) => {
  console.error('写入文件时发生错误:', err);
});

// 处理完成后的回调
writableStream.on('finish', () => {
  console.log(`处理完成！提取的文本已保存到 ${destinationPath}`);
});

// 使用管道连接流
console.log(`正在从 ${sourcePath} 提取文本...`);
readableStream.pipe(htmlRemover).pipe(writableStream);
