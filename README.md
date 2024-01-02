# v2ex_push
v2ex消息通知推送脚本(青龙面板)

## 拉库
```
ql repo https://github.com/yafoo/v2ex_push.git
```

## 订阅

青龙面板->订阅管理->创建订阅
```
名称：v2ex消息通知
类型：公开仓库
链接：https://github.com/yafoo/v2ex_push.git
定时类型：interval
定时规则：每10天
```

## 脚本配置

脚本首次运行后，会在脚本同目录生成`v2ex_config.json`配置文件

本脚本每5分钟运行一次，但默认并不会5分钟就查询一次v2ex接口，而是根据配置，动态调整。

- 参数api_query_limit，设置是否开启动态调整。

- 参数api_query_limit_time，默认86400，即1天，即当最后消息超过一天时，开始动态调整。

- 参数api_query_limit_peroid_time，默认3600，即1小时，即动态调整时，每1小时查询一次v2接口。

这个配置主要是为v2ex接口省流的，请根据自己需要调整。