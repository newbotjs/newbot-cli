{{#if native_nlp }}import processNlp from 'newbot-nlp'{{/if}}
{{#if dialogflow }}import dialogflowSkill from 'newbot-dialogflow'{{/if}}
import formats from 'newbot-formats'
import code from './main.converse'
{{#if i18n }}import languages from './languages'{{/if}}
import helloSkill from './skills/hello/hello' 

export default {{#if native_nlp }}async () =>{{/if}} {
{{#if native_nlp }}return { {{/if}}
        code, 
        skills: {
            formats,
            helloSkill,
            {{#if dialogflow }}
            dialogflow: dialogflowSkill({
                projectId: 'newagent-1-c9b25',  // https://dialogflow.com/docs/agents#settings,
                sessionId: 'quickstart-session-id',
                languageDefault: 'en-EN', // optionnal
                credentials: 'PATH_TO_JSON_FILE' // https://cloud.google.com/docs/authentication/production
            })
            {{/if}}
        },
        {{#if i18n }}languages,{{/if}}
        {{#if native_nlp }}
        nlp: {
            processNlp: await processNlp(__dirname + '/model/model.nlp')
        },
        propagateNlp: true
        {{/if}}
{{#if native_nlp }} } {{/if}} 
}