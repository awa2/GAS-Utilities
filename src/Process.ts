export class EventStore {
    private e: string;
    constructor() {
        this.e = JSON.stringify({});
    }
    public store(e: Object) {
        this.e = JSON.stringify(e);
        PropertiesService.getUserProperties().setProperty(ScriptApp.getScriptId(), this.e);
    }
    public load() {
        const e = PropertiesService.getUserProperties().getProperty(ScriptApp.getScriptId());
        if (e) {
            this.e = e;
            return JSON.parse(e);
        } else {
            return {};
        }
    }
}

export class process {
    public static id: string = ScriptApp.getScriptId();
    public static env: { [key: string]: Object | string | number } = {};

    public static CurrentUser: { email: string } = { email: Session.getActiveUser().getEmail() };
    public static EffectiveUser: { email: string, access_token?: string } = { email: Session.getActiveUser().getEmail(), access_token: ScriptApp.getOAuthToken() };

    public static web: { url: string } = { url: ScriptApp.getService().isEnabled() ? ScriptApp.getService().getUrl() : '' };
    public static event: EventStore = new EventStore();
    public static MODE = {
        PRODUCTION: 'production',
        STAGING: 'staging',
        DEVELOPMENT: 'development'
    }
    public static mode: string = process.MODE.PRODUCTION;
    public static log(obj: Object) {
        console.log(obj);
        Logger.log(JSON.stringify(obj, null, 2));
    }
    public static debug(obj: Object) {
        switch (this.mode) {
            case process.MODE.PRODUCTION:
                break;
            case process.MODE.STAGING:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;
            case process.MODE.DEVELOPMENT:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;

            default:
                break;
        }
    }
    public static save() {
        for (const key in process.env) {
            const env = process.env[key];
            switch (typeof env) {
                case 'function':
                case 'object':
                    PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(env));
                    break;
                default:
                    PropertiesService.getScriptProperties().setProperty(key, env.toString());
                    break;
            }

        }

    }
}

const properties = PropertiesService.getScriptProperties().getProperties();
for (const key in properties) {
    if (properties.hasOwnProperty(key)) {
        const property = (properties as { [key: string]: any })[key];
        try {
            process.env[key] = JSON.parse(property);
        } catch (e) {
            process.env[key] = property;
        }
    }
}