# rooster-static
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
在项目的根目录里可以放置一个`simple-host.json`的配置文件可以配置，内容如下
```json
{ "port": 80 }
```

## 启动
```
npm run start
```

## 调试
设置`localStorage`的`debug`变量为`true`开启调试模式
![5 q2b6xux3oa20 ydnw_ 0](https://user-images.githubusercontent.com/5030312/28817675-8cc5892a-76db-11e7-89dd-45ae68b10c84.png)
