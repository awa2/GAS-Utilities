import EventObject from './EventObject';
export class SubmitEvent {
    public body: { [Key: string]: Object }
    public email: string;
    public responses: EventObject.FormResponse[];
    constructor(e: EventObject.Spreadsheet.onSubmit | EventObject.Form.onSubmit, names: string[] | Definition[]) {
        this.body = {};
        if ((e as { [key: string]: any })['response']) {
            // Google Form driven
            const event = e as EventObject.Form.onSubmit;
            this.email = event.response.getRespondentEmail();

            this.responses = event.response.getItemResponses().map((itemReponse, i) => {
                return {
                    title: itemReponse.getItem().getTitle(),
                    index: itemReponse.getItem().getIndex(),
                    id: itemReponse.getItem().getId(),
                    type: itemReponse.getItem().getType(),
                    feedback: itemReponse.getFeedback(),
                    score: itemReponse.getScore(),
                    response: itemReponse.getResponse()
                }
            });

            if(typeof names[0]=== "string"){
                (names as string[]).forEach((name,i) => {
                    this.body[name] = this.responses[i].response;
                })
            } else {
                (names as Definition[]).forEach((name,i) => {
                    const value = this.responses.filter( response => {
                        return response.title === name.title;
                    });
                    if(value.length){
                        this.body[name.key] = value[0];
                    }
                })
            }

        } else {
            // Google Spreadsheet driven
            const event = e as EventObject.Spreadsheet.onSubmit;
            this.email = event.values[1]; // because values start timestamp, email and responses
            this.responses = event.values.slice(2).map((itemReponse, i) => {
                return { response: itemReponse }
            });
            if(typeof names[0]=== "string"){
                (names as string[]).forEach((name,i) => {
                    this.body[name] = this.responses[i].response;
                })
            } else {
                (names as Definition[]).forEach((name,i) => {
                    const value = event.namedValue[name.title];
                    if(value){
                        switch (value.length) {
                            case 0: this.body[name.key] = name.isArray ? [] : ''; break;
                            case 1: this.body[name.key] = name.isArray ? value : value[0]; break;
                            default: this.body[name.key] = name.isArray ? value : value.join(); break;
                        } 
                    }
                })
            }

        }
    }
}

type Definition = {
    title: string,
    key: string,
    isArray?: boolean
}