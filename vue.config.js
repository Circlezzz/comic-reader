module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
            "win": {  // 更改build下选项
                "target": [
                  {
                    "target": "nsis" // 我们要的目标安装包
                  }
                ]
              },
              "nsis": {
                "oneClick": false, // 是否一键安装
                "allowToChangeInstallationDirectory": true, // 允许修改安装目录
              },
        }
      }
    }
  }