import { Confirmation, DialogflowConversation, GoogleCloudDialogflowV2WebhookRequest } from "actions-on-google";
import { WebhookClient } from "dialogflow-fulfillment";
import { IIntentHandler } from "../interfaces/intent-handler";
import { Intents } from "../models/enums";
import { IPersist } from "../models/persist";
import { IQuizResult } from "../models/quiz";
import { QuizService } from "../services/quiz-service";
import { BaseIntentHandler } from "./base-intent-handler";

export class NumberIntentHandler extends BaseIntentHandler implements IIntentHandler {
    constructor() {
        super(Intents.NUMBER);
    }
    public handle(agent: WebhookClient) {
        const conv: DialogflowConversation = agent.conv(); // Get Actions on Google library conv instance
        const body: GoogleCloudDialogflowV2WebhookRequest = conv.body as GoogleCloudDialogflowV2WebhookRequest;
        // conv.ask("You just say the number: ", body.queryResult.parameters.number); // Use Actions on Google library
        const { quiz, retry } = conv.data as IPersist;
        if (quiz.result.toString() !== body.queryResult.parameters.number.toString()) {

            if (retry >= 3) {
                conv.close("Sorry!!, You have anwser 4 time wrong");
                conv.close("The quiz has been ended, Good luck next time, Your best level is: " + quiz.level);
                conv.data = { quiz };
            } else {
                conv.ask(`Your anwser: ${body.queryResult.parameters.number} is not correct, please try again`);
                conv.ask(`what is ${quiz.left} ${quiz.operator} ${quiz.right} = `);
                conv.data = { quiz, retry: retry + 1 };
            }
        } else {
            const service = new QuizService(quiz.level + 1);
            const nextQuizi = service.generateQuiz();

            conv.ask("Great!, Your anwser is correct.");
            const storage = conv.user.storage as any;
            const bestLevel = storage.bestLevel || 0;

            conv.data = {
                quiz: nextQuizi,
                retry: 0,
            };
            conv.user.storage = {
                bestLevel: Math.max(quiz.level, bestLevel),
            };
            // tslint:disable-next-line:max-line-length
            conv.ask(`Here is your next challenge, what is ${nextQuizi.left} ${nextQuizi.operator} ${nextQuizi.right} = `);
        }
        agent.add(conv);

    }
}
