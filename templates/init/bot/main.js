{{#if dialogflow }}import dialogflowSkill from 'newbot-dialogflow'{{/if}}
import formats from 'newbot-formats'
import code from './main.converse'
{{#if i18n }}import languages from './languages'{{/if}}
import helloSkill from './skills/hello/hello' 

export default {
    code, 
    {{#if i18n }}languages,{{/if}}
    skills: {
        formats,
        {{#if dialogflow }}
        dialogflow: dialogflowSkill({
            projectId: 'newagent-1-c9b25',  // https://dialogflow.com/docs/agents#settings,,
            languageDefault: 'en-EN', // optionnal
            credentials: 'PATH_TO_JSON_FILE' // https://cloud.google.com/docs/authentication/production
        }),
        {{/if}}
        helloSkill
    }
}