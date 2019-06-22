namespace EventObject {
    export namespace Spreadsheet {
        export type onSubmit = {
            authMode: GoogleAppsScript.Script.AuthMode;
            namedValues: { [key: string]: Array<string> };
            range: GoogleAppsScript.Spreadsheet.Range;
            triggerUid: number;
            values: string[];
        }
    }
    export namespace Form {
        export type onSubmit = {
            authMode: GoogleAppsScript.Script.AuthMode;
            response: GoogleAppsScript.Forms.FormResponse;
            source: GoogleAppsScript.Forms.Form;
            triggerUid: number;
        }
    }
    export type FormResponse = {
        title?: string,
        index?: number,
        id?: number,
        type?: GoogleAppsScript.Forms.ItemType,
        feedback?: Object,
        score?: Object,
        response: Object
    }
    export type Request = {
        queryString?: string | null,
        parameter?: { [key: string]: Object },
        parameters?: { [key: string]: Array<Object> },
        contextPath?: string,
        contentLength?: number,
        postData?: {
            length: number,
            type: string,
            contents: string,
            name: string
        }
    }
}
export default EventObject;