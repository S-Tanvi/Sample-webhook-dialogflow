module.exports = {
    apps: [
        {
            name: "IT-helpdesk-webhook",
            script: "app.js",
            instances: 1,
            exec_mode: "fork"
        }
    ]
}