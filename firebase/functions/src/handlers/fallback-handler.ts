import {WebhookClient} from "dialogflow-fulfillment";
import {Intents} from "../models/enums";
import {BaseIntentHandler} from "./base-intent-handler";
export class FallbackIntentHandler extends BaseIntentHandler {
    constructor() {
        super(Intents.FALLBACK);
    }
    public handle(agent: WebhookClient) {
        console.log("LOL it going to fallback");
        agent.add("Hello, This is falback intent. bad luck!");
    }
}
