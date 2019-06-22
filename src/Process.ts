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

export class Process {
    public static id: string = ScriptApp.getScriptId();
    public static env: { [key: string]: Object } = {};

    public static CurrentUser: { email: string } = { email: Session.getActiveUser().getEmail() };
    public static EffectiveUser: { email: string, access_token?: string } = { email: Session.getActiveUser().getEmail(), access_token: ScriptApp.getOAuthToken() };

    public static web: { url: string } = { url: ScriptApp.getService().isEnabled() ? ScriptApp.getService().getUrl() : '' };
    public static event: EventStore = new EventStore();
    public static MODE = {
        PRODUCTION: 'production',
        STAGING: 'staging',
        DEVELOPMENT: 'development'
    }
    public static mode: string = Process.MODE.PRODUCTION;
    public static log(obj: Object) {
        console.log(obj);
        Logger.log(JSON.stringify(obj, null, 2));
    }
    public static debug(obj: Object) {
        switch (this.mode) {
            case Process.MODE.PRODUCTION:
                break;
            case Process.MODE.STAGING:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;
            case Process.MODE.DEVELOPMENT:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;

            default:
                break;
        }
    }
}

const properties = PropertiesService.getScriptProperties().getProperties();
for (const key in properties) {
    if (properties.hasOwnProperty(key)) {
        const property = (properties as { [key: string]: any })[key];
        try {
            Process.env[key] = JSON.parse(property);
        } catch (e) {
            Process.env[key] = property;
        }
    }
}