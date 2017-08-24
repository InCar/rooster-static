const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const logger = require('koa-logger');
const send = require('koa-send');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const copy = require('copy-to');

var simpleHostConfig = {
    "port": 8080
}

var configPath = path.join(__dirname, 'simple-host.json');
if(fs.existsSync(configPath)){
    copy(require(configPath)).override(simpleHostConfig);
}

app.use(logger());
app.use(conditional());
app.use(etag());
app.use(static(path.join(__dirname, 'src')));

app.use(async (ctx, next) => {
    if (/^\/(about|demo|3rd)\/?/.test(ctx.request.url)) {
        await send(ctx, 'index.html', { root: path.join(__dirname, 'src') });
    }
});

app.listen(simpleHostConfig.port);
console.info("koa is listening in port " + simpleHostConfig.port);