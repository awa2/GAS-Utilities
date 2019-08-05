import { process } from './Process';
import { md5sum } from './Hash';

export default class BatchApp {
    public now = new Date();
    public last_completed_at: Date;
    public interval: number;
    private functionName: string;
    constructor(functionName: string, interval?: number) {
        this.functionName = functionName;
        this.interval = interval ? interval : 5;
        const COMPLETED_AT = process.env['BATCH_COMPLETED_AT']
        this.last_completed_at = COMPLETED_AT && typeof (COMPLETED_AT) === 'string' ? new Date(COMPLETED_AT) : new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes() - this.interval);
    }

    public start(){
        this.now = new Date();
    }

    public on( callback: (from: Date, to: Date) => any){
        return callback(this.last_completed_at, this.now);
    }

    public onGmailReceived(search: string, callback: (latestMessage: GoogleAppsScript.Gmail.GmailMessage) => any) {
        const conditionKey = md5sum(search);
        const after = this.last_completed_at.valueOf()/1000

        const Threads = GmailApp.search(`${search} after:${after}`);
        const rets = Threads.map( Thread => {
            const Messages = Thread.getMessages();
            return Messages.map( Message => {
                if( this.last_completed_at < Message.getDate()){
                    return callback(Message);
                }
            })
        });
        return rets.length;
    }

    // public onCalendarCreated(){
    // }

    public end() {
        try {
            this.stop();
        } catch (error) {
            console.info('No trigger is matched so any trigger is not deleted');
        }
        this.createNextTrigger();

        // Update time that batch completed
        process.env['BATCH_COMPLETED_AT'] = this.now.toISOString();
        process.save();
    }

    public stop(){
        const isSuccess = this.deleteCurrentTrigger();
        if(isSuccess){
            return true;
        } else {
            throw 'No trigger is matched'
        }
    }

    public createNextTrigger(){
        const newTriggerId = ScriptApp.newTrigger(this.functionName).timeBased().after(this.interval * 60 * 1000).create().getUniqueId();
        process.env['TRIGGER_ID'] = newTriggerId;
        return newTriggerId;
    }
    public deleteCurrentTrigger(){
        return ScriptApp.getProjectTriggers().some(trigger => {
            const triggerId = trigger.getUniqueId();
            if (triggerId === process.env['TRIGGER_ID']) {
                // console.log(`[DELETE TRIGGER] - ${triggerId}`);
                ScriptApp.deleteTrigger(trigger);
                return true;
            }
        });
    }
}