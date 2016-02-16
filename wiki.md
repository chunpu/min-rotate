简单的文件转储

配置文件支持 json 和 yaml

### 注意点

- 用文件名管理状态，不用文件的 stat，因为文件名更加直观，ls 就能看了
- 所有时间单位都是秒
- 只支持重命名方式的 rotate，不支持复制
- rotate 生成的文件名带有 rotate，时间信息
- 不 rotate 任何文件名带有 rotate 的文件
- 使用`last-rotate` 文件来实现interval 功能，类似 `/var/lib/logrotate/status`
- 程序是无状态的，这次的 rotate 和 上次的 rotate 无关，只和当前的文件有关，同时也更便于做测试
- 暂不支持自定义 rotate 文件名
- 压缩时文件名为(假如是 gzip) `.gz.ing`，结束后变为 `.gz`，因为压缩时间很长，容易被 kill，因此需要清晰标注是否结束，这也是制作此程序的原因

### rotate 后文件名

假设原文件: filename.log
rotate 后: filename.log-rotate-20160101-0400
压缩的 rotate 后: filename.log-roate-20160101-0400.gz

### 配置参数支持如下

参数参照 `man logrotate`

- filename: blob 格式，支持逗号
- shouldCompress: 是否压缩，缺省 false
- interval: 间隔，缺省 `Infinity`
- postrename: 文件重命名执行脚本，例如 nginx 日志则是 `nginx -s reopen`
- maxsize: 文件最大大小，超过则强制 rotate，无视 interval，缺省值为 `Infinity`
- minsize: 文件最小大小，小于最小值则不会 rotate，无视 interval，缺省值为 `0`
- count: rotate 个数，缺省值为5

默认配置

```json
{
	filename: 'custom',
	shouldCompress: false,
	...
}
```

### 实现逻辑

- 根据 blob 列出所有 files
- 去掉文件名中带有 rotate 的文件
- 遍历 files
	- 根据 `shouldRotate(file)` 过滤出需要 rotate 的文件，得到新的 files
- 遍历 files
	- 重命名文件为 `filename-rotate-20160101-0400` (例子而已)
- 保存 files 重命名后数组 renamedFiles，可能会要后续处理
- 如果有 postrename 脚本
	- 执行 postrename 脚本
	- postrename 脚本报错则打印日志
- 如果 shouldCompress 为 true
	- `cleanDisk(renamedFiles 总大小)` 确保磁盘足够
	- 遍历 renamedFiles，限制同时压缩数，建议为3
		- 压缩文件，取名后缀为 `.ing`
		- 压缩完毕后去掉后缀 `.ing`

TODO 清理压缩失败的文件

#### parseRotateFile(filename)

#### shouldRotate(filename) 实现

- 如果 file.size 大于 maxsize
	- 返回 true
- 如果 file.size 小于 minsize
	- 返回 false
- 如果 `now - file.lastRotate > interval`
	- 返回 true
- 返回 false

#### cleanDisk(size, callback) 实现

始终删除最旧的文件

#### getDiskFree() 实现

TODO 磁盘满的问题，提供接口来便于 mock 测试

### 配合 crond

### debug 与 查错

