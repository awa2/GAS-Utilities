import EventObject from './EventObject';
export class SubmitEvent {
    public body: { [Key: string]: Object }
    public email: string;
    public responses: EventObject.FormResponse[];
    constructor(e: EventObject.Spreadsheet.onSubmit | EventObject.Form.onSubmit, asNames: string[]) {
        this.body = {};
        if ((e as {[key:string]:any})['response']) {
            const event = e as EventObject.Form.onSubmit;
            this.email = event.response.getRespondentEmail();
            this.responses = event.response.getItemResponses().map((itemReponse, i) => {
                this.body[asNames[i]] = itemReponse.getResponse();
                return {
                    title: itemReponse.getItem().getTitle(),
                    index: itemReponse.getItem().getIndex(),
                    id: itemReponse.getItem().getId(),
                    type: itemReponse.getItem().getType(),
                    feedback: itemReponse.getFeedback(),
                    score: itemReponse.getScore(),
                    response: this.body[asNames[i]]
                }
            });

        } else {
            // Google SpreadsheetのイベントからForm送信を呼び出した場合 ※現在はこっちを利用
            const event = e as EventObject.Spreadsheet.onSubmit;
            this.email = event.values[1]; // because values start taimestamp, email and responses
            this.responses = event.values.slice(2).map((itemReponse, i) => {
                this.body[asNames[i]] = itemReponse;
                return {
                    response: itemReponse
                }
            });
        }
    }
}