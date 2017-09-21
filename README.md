# rooster-static
[![Build Status](https://travis-ci.org/InCar/rooster-static.svg?branch=master)](https://travis-ci.org/InCar/rooster-static)

前端静态资源

## 安装依赖项
```
npm install -g gulp-cli
npm install
```

对于中国内地用户,可以配置使用淘宝的的镜像站点
```shell
npm config registry=https://registry.npm.taobao.org -g
npm install -g gulp-cli
npm install
```

## 编译
```shell
# 正常编译
gulp

## 重新编译
gulp clean
gulp
```

## 配置
1. 在项目的根目录里可以放置一个`simple-host.json`的配置文件可以配置，内容如下
```json
{ "port": 80 }
```

2. 使用域名`local.incarcloud.com`来进行本机调试工作

因为公共js比如(jquery)采用从我们的cdn来加载,出于安全原因
我们限制cdn只接受来自incarcloud.com内的访问请求

而local.incarcloud.com被解析为127.0.0.1

3. 把`src/js/settings-sample.js`拷贝成`src/js/settings.js`，修改其中的内容以适合你自己开发环境配置。

当在内网进行调试时,由于QQ登录的跳转URL有安全限制,可以利用state参数进行中转跳转

把qq登录链接设置为如下值
```
https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101419871&redirect_uri=http%3a%2f%2fmy.incarcloud.com%2f3rd%2fqq&state=%7b%22url%22%3a%22http%3a%2f%2flocal.incarcloud.com%2f3rd%2fqq%22%7d
```
这里关键点在于把`redirect_uri`设置为QQ登录允许的公网URL`http://my.incarcloud.com/3rd/qq`
这样会在QQ登录成功后,会跳转到公网页面上,
这个页面会检测state里的url参数,如果这个参数存在,那么会在浏览器里再进行一次跳转.
这个url可以指定一个内网地址

## 启动
```
npm run start
```

然后用浏览器访问你配置的域名和端口比如`http://local.incarcloud.com:80`

## 调试
设置`localStorage`的`debug`变量为`true`开启调试模式
![5 q2b6xux3oa20 ydnw_ 0](https://user-images.githubusercontent.com/5030312/28817675-8cc5892a-76db-11e7-89dd-45ae68b10c84.png)
