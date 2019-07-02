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

    public on( callback: (from: Date, to: Date) => any){
        return callback(this.updated_at, this.now);
    }

    public onGmailReceived(search: string, callback: (latestMessage: GoogleAppsScript.Gmail.GmailMessage) => any) {
        const conditionKey = md5sum(search);
        const after = this.updated_at.valueOf()/1000

        const Threads = GmailApp.search(`${search} after:${after}`);
        const rets = Threads.map( Thread => {
            const Messages = Thread.getMessages();
            return Messages.map( Message => {
                if( this.updated_at < Message.getDate()){
                    return callback(Message);
                }
            })
        });
        return rets.length;
    }

    public onCalendarCreated(){
    }

    public end() {
        const newTrigger = ScriptApp.newTrigger(this.functionName).timeBased().after(this.interval * 60 * 1000).create().getUniqueId();
        this.stop();
        process.env['TRIGGER_ID'] = newTrigger;
        process.env['BATCH_UPDATED_AT'] = this.now.toISOString();
        process.save();
    }

    public stop(){
        ScriptApp.getProjectTriggers().some(trigger => {
            if (trigger.getUniqueId() === process.env['TRIGGER_ID']) {
                ScriptApp.deleteTrigger(trigger);
                return true;
            }
        });
    }
}