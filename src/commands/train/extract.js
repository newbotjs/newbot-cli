import {
    Converse
} from 'newbot'
import _ from 'lodash'

class ExtractIntents {
    constructor(skill, NlpManager) {
        this.skill = skill
        this.NlpManager = NlpManager
        this.cacheLang = {}
        this.cache = []
        this.languages = []
        this.converse = new Converse()
    }

    async getIntents() {
        await this.converse.loadOptions(this.skill.default)
        const intents = await this.converse.getAllIntents()
        for (let intent of intents) {
            const langs = _.get(intent, '_skill.lang._list')
            if (langs) {
                this.languages = [
                    ...this.languages,
                    ...langs.map(lang => lang.split('_')[0])
                ]
                this.languages = _.uniq(this.languages)
            }
            let [intentName, utterances] = intent.params
            if (_.isArray(utterances)) {
                utterances = {
                    en: utterances
                }
            }
            for (let lang in utterances) {
                if (lang[0] == '_') continue
                this.cacheLang[lang] = true
                for (let utterance of utterances[lang]) {
                    this.cache.push({
                        params: [lang, utterance, intentName],
                        converse: intent._skill
                    })
                }
            }
        }
    }

    translate() {
        const langFiles = this.languages
        let cacheClone = []

        for (let i = 0 ; i < this.cache.length ; i++) {
            let { params } = this.cache[i]
            
            if (params[1][0] != '#') {
                cacheClone.push(_.clone(params))
                continue
            }
            const translateAndMemorize = (instanceLang, langId, text) => {
                const translated = instanceLang.translate(text)
                cacheClone.push([langId, translated, this.cache[i].params[2]])
            }
            
            for (let lang of langFiles) {
                let langId = lang
                const text = params[1].substr(1)
                const instanceLang = this.cache[i].converse.lang
                const fullLang = langId + '_' + langId.toUpperCase()
                instanceLang.set(fullLang)
                const group = instanceLang.getGroup(text)
                if (group.length > 0) {
                    for (let gtext of group) {
                        translateAndMemorize(instanceLang, langId, gtext)
                    }
                }
                else {
                    translateAndMemorize(instanceLang, langId, text)
                }
            }
        }
        for (let lang of langFiles) {
            this.cacheLang[lang] = true
        }
        this.cache = cacheClone  
    }

    addDocuments() {
        this.manager = new this.NlpManager({
            languages: Object.keys(this.cacheLang)
        })
        for (let params of this.cache) {
            this.manager.addDocument(...params)
        }
        return this.manager
    }
}

export default ExtractIntents