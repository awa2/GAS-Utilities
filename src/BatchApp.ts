import { process } from './Process';
import { md5sum } from './Hash';

export default class BatchApp {
    public now = new Date();
    public updated_at: Date;
    public interval: number;
    private functionName: string;
    constructor(functionName: string, interval?: number) {
        this.functionName = functionName;
        this.interval = interval ? interval : 5;
        const UPDATED_AT = process.env['BATCH_UPDATED_AT']
        this.updated_at = UPDATED_AT && typeof (UPDATED_AT) === 'string' ? new Date(UPDATED_AT) : new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes() - this.interval);
    }

    public onGmailReceived(search: string, callback: (latestMessage: GoogleAppsScript.Gmail.GmailMessage) => any) {
        const conditionKey = md5sum(search);

        const Threads = GmailApp.search(search);
        if (Threads) {
            const Messages = Threads[0].getMessages();
            const Message = Messages[0];

            if (process.env[conditionKey] && process.env[conditionKey]['id'] === Message.getId()) {
                return false;
            } else {
                process.env[conditionKey] = {
                    condition: search,
                    id: Message.getId()
                }
                return callback(Message);
            }
        } else {
            return false;
        }
    }

    public onCalendarCreated(){
    }
    public end() {
        const newTrigger = ScriptApp.newTrigger(this.functionName).timeBased().after(this.interval * 60 * 1000).create().getUniqueId();
        ScriptApp.getScriptTriggers().some(trigger => {
            if (trigger.getUniqueId() === process.env['TRIGGER_ID']) {
                ScriptApp.deleteTrigger(trigger);
                return true;
            }
        });
        process.env['TRIGGER_ID'] = newTrigger;
        process.env['BATCH_UPDATED_AT'] = this.now.toISOString();
        process.save();
    }
}