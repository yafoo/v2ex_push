// v2ex消息通知
// 本脚本运行于青龙面板，依赖系统自带got js库
// */5 * * * *
// 新建环境变量V2EX_TOKEN，设置token
// v2ex_config.json，运行参数：
// last_message_id：最后消息ID
// last_message_time：最后消息时间
// last_query_time: 最后查询时间
// api_query_limit: 接口请求限制，默认为true
// api_query_limit_time: 最后消息超过多长时间开始接口限制，默认86400
// api_query_limit_peroid_time: 接口开始限制时多长时间查询一次，默认3600

(async function() {
    const fs = require('fs');
    const {sendNotify} = require('./sendNotify');
    const time = () => Math.round(new Date() / 1000);

    const {default: got} = await import('got');
    const request = async (api_name, params={}, method='get') => {
        const options = {
            headers: {
                Authorization: `Bearer ${process.env.V2EX_TOKEN}`
            },
            ...params
        }
        const res = await got[method]('https://www.v2ex.com/api/v2/' + api_name, options).json();
        return res;
    }

    const config_file = './v2ex_config.json';
    let config = {};
    if(fs.existsSync(config_file)) {
        const temp_data = fs.readFileSync(config_file, 'utf-8');
        config = JSON.parse(temp_data.toString());
    }

    const now_time = time();
    if(!config.last_message_id || !config.api_query_limit || now_time - config.last_message_time < config.api_query_limit_time || now_time - config.last_query_time > config.api_query_limit_peroid_time) {
        doTask();
    } else {
        console.log('v2ex_push任务执行成功，本次未调用API！');
    }

    function doTask(p = 1) {
        const res = await request(`notifications?p=${p}`);
        if(res && res.success && res.result && res.result.length) {
            const list = res.result;
            if(!config.last_message_id) {
                const info = parseNotifyInfo(list[0]);
                info[0] += '[首次运行，测试]';
                sendNotify(...info);

                config.last_message_id = list[0].id;
                config.last_message_time = list[0].created;
                config.last_query_time = time();
                config.api_query_limit = true;
                config.api_query_limit_time = 86400;
                config.api_query_limit_peroid_time = 3600;
            } else {
                list.reverse().forEach(data => {
                    if(data.id > config.last_message_id) {
                        sendNotify(...parseNotifyInfo(data));

                        config.last_message_id = data.id;
                        config.last_message_time = data.created;
                        config.last_query_time = time();
                    }
                });
            }
            fs.writeFileSync(config_file, JSON.stringify(config, null, 4) , 'utf-8');
            console.log('v2ex_push任务执行成功！');
        } else {
            sendNotify('[f][v2ex]任务执行失败！');
            console.log('v2ex_push任务执行失败！');
        }
    }

    function parseNotifyInfo(data) {
        const info = [];
        const reg_reply = /在 <a href="(.+)" class="topic-link">(.+)<\/a> 里回复了你/g;
        const reg_star = /收藏了你发布的主题 › <a href="(.+)" class="topic-link">(.+)<\/a>/g;
        const reg_thank = /感谢了你在主题 › <a href="(.+)" class="topic-link">(.+)<\/a> 里的回复/g;
        const reg_at = /在回复 <a href="(.+)" class="topic-link">(.+)<\/a> 时提到了你/g;
        let reg_data = reg_reply.exec(data.text);
        if(reg_data) {
            info.push(`[v2ex]${data.member.username}回复了你`);
            info.push(`> ${data.payload}\n\n###### [《${reg_data[2]}》](https://www.v2ex.com${reg_data[1]})`);
        } else if(reg_data = reg_star.exec(data.text)) {
            info.push(`[v2ex]${data.member.username}收藏了你的主题`);
            info.push(`###### [《${reg_data[2]}》](https://www.v2ex.com${reg_data[1]})`);
        } else if(reg_data = reg_thank.exec(data.text)) {
            info.push(`[v2ex]${data.member.username}感谢了你的回复`);
            info.push(`> ${data.payload}\n\n###### [《${reg_data[2]}》](https://www.v2ex.com${reg_data[1]})`);
        } else if(reg_data = reg_at.exec(data.text)) {
            info.push(`[v2ex]${data.member.username}感谢了你的回复`);
            info.push(`> ${data.payload}\n\n###### [《${reg_data[2]}》](https://www.v2ex.com${reg_data[1]})`);
        } else {
            info.push(`[v2ex]新消息`);
            info.push(`> ${data.payload}\n\n${data.text}`);
        }
        info.push({type: 'markdown'});
        info.push(`\n\n　\n\n本通知 By：https://push.i-i.me/`);
        return info;
    }
})();