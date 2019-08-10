import { process } from './Process';
import { md5sum } from './Hash';

declare const Calendar: any;
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

    public start() {
        this.now = new Date();
    }

    public on(callback: (from: Date, to: Date) => any) {
        return callback(this.last_completed_at, this.now);
    }

    public onGmailReceived(search: string, callback: (latestMessage: GoogleAppsScript.Gmail.GmailMessage) => any) {
        const conditionKey = md5sum(search);
        const after = this.last_completed_at.valueOf() / 1000

        const Threads = GmailApp.search(`${search} after:${after}`);
        const rets = Threads.map(Thread => {
            const Messages = Thread.getMessages();
            return Messages.map(Message => {
                if (this.last_completed_at < Message.getDate()) {
                    return callback(Message);
                }
            })
        });
        return rets.length;
    }

    public onCalendarModified(calendarId: string, callback: (CalendarEvents: CalendarEvent[]) => any) {
        const option = {
            syncToken: PropertiesService.getUserProperties().getProperty('CALENDAR_SYNC_TOKEN'),
            maxResults: 100
        }
        let pageToken;
        let res: any;
        let Events: any[];
        do {
            try {
                res = Calendar.Events.list(calendarId, option) as { items: CalendarEvent[], nextPageToken?: string, nextSyncToken: string }
            } catch (error) {
                if (error.message === 'Sync token is no longer valid, a full sync is required.') {
                    PropertiesService.getUserProperties().deleteProperty('CALENDAR_SYNC_TOKEN');
                    return;
                } else {
                    throw new Error(error.message);
                }
            }
            if (res.items && res.items.length > 0) {
                // 1 - Events found
                Events = [Events, ...res.items];
            } else {
                // 2 - No events found
            }
            pageToken = res.nextPageToken;
        } while (pageToken);
        PropertiesService.getUserProperties().setProperty('CALENDAR_SYNC_TOKEN', res.nextSyncToken);
        return Events;
    }
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

    public stop() {
        const isSuccess = this.deleteCurrentTrigger();
        if (isSuccess) {
            return true;
        } else {
            throw 'No trigger is matched'
        }
    }

    public createNextTrigger() {
        const newTriggerId = ScriptApp.newTrigger(this.functionName).timeBased().after(this.interval * 60 * 1000).create().getUniqueId();
        process.env['TRIGGER_ID'] = newTriggerId;
        return newTriggerId;
    }
    public deleteCurrentTrigger() {
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

interface CalendarEvent {
    kind: 'calendar#event',
    etag: string,
    id: string,
    status: 'confirmed' | 'tentative' | 'cancelled',
    htmlLink: string,
    created: string,
    updated: string,
    summary: string,
    description: string,
    location: string,
    colorId: string,
    creator: {
        id: string,
        email: string,
        displayName: string,
        self: boolean
    },
    organizer: {
        id: string,
        email: string,
        displayName: string,
        self: boolean
    },
    start: {
        date?: string, // yyyy-MM-dd
        dateTime?: string,
        timeZone?: string
    },
    end: {
        date?: string, // yyyy-MM-dd
        dateTime?: string,
        timeZone?: string
    },
    endTimeUnspecified: boolean,
    recurrence: [
        string
    ],
    recurringEventId: string,
    originalStartTime: {
        date: string,  // yyyy-MM-dd
        dateTime: string,
        timeZone: string
    },
    transparency: string,
    visibility: string,
    iCalUID: string,
    sequence: number,
    attendees: [
        {
            id: string,
            email: string,
            displayName: string,
            organizer: boolean,
            self: boolean,
            resource: boolean,
            optional: boolean,
            responseStatus: string,
            comment: string,
            additionalGuests: number
        }
    ],
    attendeesOmitted: boolean,
    extendedProperties: {
        private: {
            [key: string]: string
        },
        shared: {
            [key: string]: string
        }
    },
    hangoutLink: string,
    conferenceData: {
        createRequest: {
            requestId: string,
            conferenceSolutionKey: {
                type: string
            },
            status: {
                statusCode: string
            }
        },
        entryPoints: [
            {
                entryPointType: string,
                uri: string,
                label: string,
                pin: string,
                accessCode: string,
                meetingCode: string,
                passcode: string,
                password: string
            }
        ],
        conferenceSolution: {
            key: {
                type: string
            },
            name: string,
            iconUri: string
        },
        conferenceId: string,
        signature: string,
        notes: string,
        gadget: {
            type: string,
            title: string,
            link: string,
            iconLink: string,
            width: number,
            height: number,
            display: string,
            preferences: {
                (key): string
            }
        },
        anyoneCanAddSelf: boolean,
        guestsCanInviteOthers: boolean,
        guestsCanModify: boolean,
        guestsCanSeeOtherGuests: boolean,
        privateCopy: boolean,
        locked: boolean,
        reminders: {
            useDefault: boolean,
            overrides: [
                {
                    method: string,
                    minutes: number
                }
            ]
        },
        source: {
            url: string,
            title: string
        },
        attachments: [
            {
                fileUrl: string,
                title: string,
                mimeType: string,
                iconLink: string,
                fileId: string
            }
        ]
    }
}