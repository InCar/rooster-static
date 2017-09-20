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

2. 【可选】把`src/js/app-dev-sample.ts`拷贝成`src/js/app-dev.ts`，修改其中的内容以适合你自己开发环境配置。

3. 【可选】在本机的`hosts`文件里配置一个`incarcloud.com`的子域名指向本机比如:
```
127.0.0.1    foo.incarcloud.com
::1          foo.incarcloud.com
```
这样在本机调试时可以访问http://foo.incarcloud.com，以启用cdn加载公共js


## 启动
```
npm run start
```

然后用浏览器访问你配置的域名和端口比如`http://foo.incarcloud.com:8080`

## 调试
设置`localStorage`的`debug`变量为`true`开启调试模式
![5 q2b6xux3oa20 ydnw_ 0](https://user-images.githubusercontent.com/5030312/28817675-8cc5892a-76db-11e7-89dd-45ae68b10c84.png)
