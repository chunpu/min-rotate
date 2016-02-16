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
- 压缩时文件名为(假如是 gzip) `.gz.ing`，结束后变为 `.gz`，因为压缩时间很长，容易被 kill，因此需要清晰标注是否结束

### rotate 后文件名

假设原文件: filename.log
rotate 后: filename.log-rotate-20160101-0400
压缩的 rotate 后: filename.log-roate-20160101-0400.gz

### 参数支持如下

参数参照 `man logrotate`

- file: blob 格式
- shouldCompress: 是否压缩，缺省 false
- interval: 间隔，缺省 `Infinity`
- postrename: 文件重命名执行脚本，例如 nginx 日志则是 `nginx -s reopen`
- maxsize: 文件最大大小，超过则强制 rotate，无视 interval，缺省值为 `Infinity`
- minsize: 文件最小大小，小于最小值则不会 rotate，无视 interval，缺省值为 `0`
- count: rotate 个数，缺省值为5

### 实现逻辑

### 配合 crond

### debug 与 查错

