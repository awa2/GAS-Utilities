export default class ConfigTemplate {
    static load(name?: string) {
        if (name) {
            ConfigTemplate.settings.some((setting) => {
                if (setting.name === name) {
                    for (const key in setting.env) {
                        ConfigTemplate.env[key] = (setting.env as { [key: string]: any })[key];
                    }
                    return true;
                } else {
                    return false;
                }
            })
        } else {
            const scriptId = ScriptApp.getScriptId();
            ConfigTemplate.settings.some((setting) => {
                if (setting.scriptId === scriptId) {
                    for (const key in setting.env) {
                        ConfigTemplate.env[key] = (setting.env as { [key: string]: any })[key];
                    }
                    return true;
                } else {
                    return false;
                }
            })
        }
    }
    static env: { [key: string]: any } = {}
    static settings: {
        name: string,
        scriptId: string,
        env: { [key: string]: Object }
    }[]
}